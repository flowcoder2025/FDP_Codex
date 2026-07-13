param(
    [string]$OutputDirectory,
    [switch]$Verify
)

$ErrorActionPreference = 'Stop'

if ([String]::IsNullOrWhiteSpace($OutputDirectory)) {
    $OutputDirectory = $PSScriptRoot
}
$OutputDirectory = [IO.Path]::GetFullPath($OutputDirectory)
$sourcePath = Join-Path $PSScriptRoot 'windows-job-runner.cs'
$executablePath = Join-Path $OutputDirectory 'windows-job-runner.exe'
$manifestPath = Join-Path $OutputDirectory 'windows-job-runner.manifest.json'
$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$buildRoot = Join-Path $tempBase ('fdp-windows-job-runner-build-' + [guid]::NewGuid().ToString('N'))
$builtExecutablePath = Join-Path $buildRoot 'windows-job-runner.exe'

function Get-Sha256Hex([string]$Path) {
    $stream = [IO.File]::OpenRead($Path)
    $sha256 = [Security.Cryptography.SHA256]::Create()
    try {
        return ([BitConverter]::ToString($sha256.ComputeHash($stream))).Replace('-', '').ToLowerInvariant()
    } finally {
        $sha256.Dispose()
        $stream.Dispose()
    }
}

function Resolve-RoslynCompiler {
    $dotnetCommand = Get-Command dotnet.exe -ErrorAction Stop
    $candidates = @(& $dotnetCommand.Source --list-sdks | ForEach-Object {
        if ($_ -match '^(?<version>[^ ]+) \[(?<root>.+)\]$') {
            $versionText = $Matches.version
            $versionCore = $versionText.Split('-')[0]
            $sdkPath = Join-Path $Matches.root $versionText
            $compilerPath = Join-Path $sdkPath 'Roslyn\bincore\csc.dll'
            if ([IO.File]::Exists($compilerPath)) {
                [PSCustomObject]@{
                    version = [version]$versionCore
                    compiler = $compilerPath
                }
            }
        }
    })
    $selected = $candidates | Sort-Object version -Descending | Select-Object -First 1
    if ($null -eq $selected) {
        throw 'No Roslyn csc.dll was found in an installed .NET SDK.'
    }
    return [PSCustomObject]@{
        dotnet = $dotnetCommand.Source
        compiler = $selected.compiler
    }
}

function Resolve-FrameworkReferences {
    $frameworkCandidates = @(
        (Join-Path $env:SystemRoot 'Microsoft.NET\Framework64\v4.0.30319'),
        (Join-Path $env:SystemRoot 'Microsoft.NET\Framework\v4.0.30319')
    )
    foreach ($frameworkPath in $frameworkCandidates) {
        $references = @(
            (Join-Path $frameworkPath 'mscorlib.dll'),
            (Join-Path $frameworkPath 'System.dll'),
            (Join-Path $frameworkPath 'System.Core.dll')
        )
        if (($references | Where-Object { -not [IO.File]::Exists($_) }).Count -eq 0) {
            return $references
        }
    }
    throw 'Required .NET Framework v4 reference assemblies were not found.'
}

try {
    if (-not [IO.File]::Exists($sourcePath)) {
        throw "Missing Windows Job runner source: $sourcePath"
    }
    [IO.Directory]::CreateDirectory($buildRoot) | Out-Null

    $compiler = Resolve-RoslynCompiler
    $references = Resolve-FrameworkReferences
    $compilerVersionOutput = @(& $compiler.dotnet exec $compiler.compiler /version)
    if ($LASTEXITCODE -ne 0 -or $compilerVersionOutput.Count -eq 0) {
        throw 'Failed to query the Roslyn compiler version.'
    }
    $compilerArguments = @(
        'exec',
        $compiler.compiler,
        '/nologo',
        '/noconfig',
        '/nostdlib+',
        '/deterministic+',
        '/target:winexe',
        ("/pathmap:{0}=/src" -f $PSScriptRoot),
        ("/out:{0}" -f $builtExecutablePath)
    )
    foreach ($reference in $references) {
        $compilerArguments += "/reference:$reference"
    }
    $compilerArguments += $sourcePath
    & $compiler.dotnet @compilerArguments
    if ($LASTEXITCODE -ne 0) {
        throw "Roslyn compiler failed with exit code $LASTEXITCODE."
    }
    [Reflection.AssemblyName]::GetAssemblyName($builtExecutablePath) | Out-Null

    $referenceHashes = [ordered]@{}
    foreach ($reference in $references) {
        $referenceHashes[[IO.Path]::GetFileName($reference)] = Get-Sha256Hex $reference
    }
    $buildReceipt = [ordered]@{
        tool = 'dotnet-roslyn-csc'
        compiler_version = ([string]$compilerVersionOutput[0]).Trim()
        compiler_sha256 = Get-Sha256Hex $compiler.compiler
        deterministic = $true
        target = 'winexe'
        path_map = '/src'
        framework = 'netfx-v4.0.30319'
        reference_sha256 = $referenceHashes
    }
    $builtHash = Get-Sha256Hex $builtExecutablePath
    $manifest = [ordered]@{
        schema_version = 2
        source = 'windows-job-runner.cs'
        source_sha256 = Get-Sha256Hex $sourcePath
        executable = 'windows-job-runner.exe'
        executable_sha256 = $builtHash
        build = $buildReceipt
    }

    if ($Verify) {
        if (-not [IO.File]::Exists($executablePath) -or -not [IO.File]::Exists($manifestPath)) {
            throw 'The checked Windows Job runner executable or manifest is missing.'
        }
        $checkedManifest = [IO.File]::ReadAllText($manifestPath) | ConvertFrom-Json
        $expectedBuild = ConvertTo-Json -InputObject $buildReceipt -Depth 6 -Compress
        $checkedBuild = ConvertTo-Json -InputObject $checkedManifest.build -Depth 6 -Compress
        $manifestMismatch = $checkedManifest.schema_version -ne 2 -or
            $checkedManifest.source -ne $manifest.source -or
            $checkedManifest.source_sha256 -ne $manifest.source_sha256 -or
            $checkedManifest.executable -ne $manifest.executable -or
            $checkedManifest.executable_sha256 -ne $builtHash -or
            (Get-Sha256Hex $executablePath) -ne $builtHash -or
            $checkedBuild -ne $expectedBuild
        if ($manifestMismatch) {
            throw 'The checked Windows Job runner is not reproducible from the tracked source and build receipt.'
        }
    } else {
        [IO.Directory]::CreateDirectory($OutputDirectory) | Out-Null
        [IO.File]::Copy($builtExecutablePath, $executablePath, $true)
        $manifestJson = ConvertTo-Json -InputObject $manifest -Depth 6
        [IO.File]::WriteAllText($manifestPath, $manifestJson + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))
    }

    [PSCustomObject]@{
        ok = $true
        verified = [bool]$Verify
        source = $sourcePath
        executable = $executablePath
        manifest = $manifestPath
        source_sha256 = $manifest.source_sha256
        executable_sha256 = $manifest.executable_sha256
        compiler_version = $buildReceipt.compiler_version
        deterministic = $true
    } | ConvertTo-Json -Compress
} finally {
    $resolvedBuildRoot = [IO.Path]::GetFullPath($buildRoot)
    $safePrefix = [IO.Path]::Combine($tempBase, 'fdp-windows-job-runner-build-')
    if (-not $resolvedBuildRoot.StartsWith($safePrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Unsafe temporary build path: $resolvedBuildRoot"
    }
    if ([IO.Directory]::Exists($resolvedBuildRoot)) {
        [IO.Directory]::Delete($resolvedBuildRoot, $true)
    }
}