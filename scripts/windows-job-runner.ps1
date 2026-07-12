$ErrorActionPreference = 'Stop'

$source = @"
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Diagnostics;
using System.Text;
using System.Threading;

public static class FdpWindowsJobRunner
{
    private const uint CREATE_SUSPENDED = 0x00000004;
    private const uint EXTENDED_STARTUPINFO_PRESENT = 0x00080000;
    private const uint STARTF_USESTDHANDLES = 0x00000100;
    private static readonly IntPtr PROC_THREAD_ATTRIBUTE_JOB_LIST = new IntPtr(0x0002000D);
    private const uint JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x00002000;
    private const int JobObjectBasicAccountingInformation = 1;
    private const int JobObjectExtendedLimitInformation = 9;
    private const uint WAIT_OBJECT_0 = 0;
    private const int STD_INPUT_HANDLE = -10;
    private const int STD_OUTPUT_HANDLE = -11;
    private const int STD_ERROR_HANDLE = -12;

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct STARTUPINFO
    {
        public int cb;
        public string lpReserved;
        public string lpDesktop;
        public string lpTitle;
        public uint dwX;
        public uint dwY;
        public uint dwXSize;
        public uint dwYSize;
        public uint dwXCountChars;
        public uint dwYCountChars;
        public uint dwFillAttribute;
        public uint dwFlags;
        public short wShowWindow;
        public short cbReserved2;
        public IntPtr lpReserved2;
        public IntPtr hStdInput;
        public IntPtr hStdOutput;
        public IntPtr hStdError;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct STARTUPINFOEX
    {
        public STARTUPINFO StartupInfo;
        public IntPtr lpAttributeList;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct PROCESS_INFORMATION
    {
        public IntPtr hProcess;
        public IntPtr hThread;
        public uint dwProcessId;
        public uint dwThreadId;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct JOBOBJECT_BASIC_LIMIT_INFORMATION
    {
        public long PerProcessUserTimeLimit;
        public long PerJobUserTimeLimit;
        public uint LimitFlags;
        public UIntPtr MinimumWorkingSetSize;
        public UIntPtr MaximumWorkingSetSize;
        public uint ActiveProcessLimit;
        public UIntPtr Affinity;
        public uint PriorityClass;
        public uint SchedulingClass;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct IO_COUNTERS
    {
        public ulong ReadOperationCount;
        public ulong WriteOperationCount;
        public ulong OtherOperationCount;
        public ulong ReadTransferCount;
        public ulong WriteTransferCount;
        public ulong OtherTransferCount;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct JOBOBJECT_EXTENDED_LIMIT_INFORMATION
    {
        public JOBOBJECT_BASIC_LIMIT_INFORMATION BasicLimitInformation;
        public IO_COUNTERS IoInfo;
        public UIntPtr ProcessMemoryLimit;
        public UIntPtr JobMemoryLimit;
        public UIntPtr PeakProcessMemoryUsed;
        public UIntPtr PeakJobMemoryUsed;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct JOBOBJECT_BASIC_ACCOUNTING_INFORMATION
    {
        public long TotalUserTime;
        public long TotalKernelTime;
        public long ThisPeriodTotalUserTime;
        public long ThisPeriodTotalKernelTime;
        public uint TotalPageFaultCount;
        public uint TotalProcesses;
        public uint ActiveProcesses;
        public uint TotalTerminatedProcesses;
    }

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr CreateJobObject(IntPtr lpJobAttributes, string lpName);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool SetInformationJobObject(
        IntPtr hJob,
        int infoClass,
        IntPtr lpJobObjectInfo,
        uint cbJobObjectInfoLength);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool QueryInformationJobObject(
        IntPtr hJob,
        int infoClass,
        out JOBOBJECT_BASIC_ACCOUNTING_INFORMATION lpJobObjectInfo,
        uint cbJobObjectInfoLength,
        IntPtr lpReturnLength);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool CreateProcess(
        string lpApplicationName,
        StringBuilder lpCommandLine,
        IntPtr lpProcessAttributes,
        IntPtr lpThreadAttributes,
        bool bInheritHandles,
        uint dwCreationFlags,
        IntPtr lpEnvironment,
        string lpCurrentDirectory,
        ref STARTUPINFOEX lpStartupInfo,
        out PROCESS_INFORMATION lpProcessInformation);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool InitializeProcThreadAttributeList(
        IntPtr lpAttributeList,
        int dwAttributeCount,
        int dwFlags,
        ref UIntPtr lpSize);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool UpdateProcThreadAttribute(
        IntPtr lpAttributeList,
        uint dwFlags,
        IntPtr attribute,
        IntPtr lpValue,
        UIntPtr cbSize,
        IntPtr lpPreviousValue,
        IntPtr lpReturnSize);

    [DllImport("kernel32.dll")]
    private static extern void DeleteProcThreadAttributeList(IntPtr lpAttributeList);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern uint ResumeThread(IntPtr hThread);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern uint WaitForSingleObject(IntPtr hHandle, uint dwMilliseconds);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetExitCodeProcess(IntPtr hProcess, out uint lpExitCode);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool TerminateJobObject(IntPtr hJob, uint uExitCode);

    [DllImport("kernel32.dll")]
    private static extern IntPtr GetStdHandle(int nStdHandle);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool CloseHandle(IntPtr hObject);

    private static void ThrowLastError(string operation)
    {
        throw new Win32Exception(Marshal.GetLastWin32Error(), operation);
    }

    private static string QuoteArgument(string value)
    {
        if (value.Length > 0 && value.IndexOfAny(new[] { ' ', '\t', '\n', '\v', '"' }) < 0)
        {
            return value;
        }

        var result = new StringBuilder();
        result.Append('"');
        var backslashes = 0;
        foreach (var character in value)
        {
            if (character == '\\')
            {
                backslashes += 1;
                continue;
            }

            if (character == '"')
            {
                result.Append('\\', backslashes * 2 + 1);
                result.Append('"');
                backslashes = 0;
                continue;
            }

            result.Append('\\', backslashes);
            result.Append(character);
            backslashes = 0;
        }

        result.Append('\\', backslashes * 2);
        result.Append('"');
        return result.ToString();
    }

    private static bool WaitForDrain(IntPtr job, int timeoutMs)
    {
        var stopwatch = Stopwatch.StartNew();
        do
        {
            JOBOBJECT_BASIC_ACCOUNTING_INFORMATION accounting;
            if (!QueryInformationJobObject(
                job,
                JobObjectBasicAccountingInformation,
                out accounting,
                (uint)Marshal.SizeOf(typeof(JOBOBJECT_BASIC_ACCOUNTING_INFORMATION)),
                IntPtr.Zero))
            {
                ThrowLastError("QueryInformationJobObject");
            }

            if (accounting.ActiveProcesses == 0)
            {
                return true;
            }

            Thread.Sleep(25);
        }
        while (stopwatch.ElapsedMilliseconds < timeoutMs);

        return false;
    }

    public static int Run(string command, string[] arguments, string workingDirectory, int controllerPid, long controllerStartFileTime, int controllerAcquireDelayMs, string controlToken)
    {
        int wrapperProcessId;
        using (var wrapper = Process.GetCurrentProcess())
        {
            wrapperProcessId = wrapper.Id;
            Console.Error.WriteLine(
                "FDP_JOB_RUNNER_ROOT:" + controlToken + "|" + wrapper.Id + "|" + wrapper.StartTime.ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss.ffffff'0Z'"));
        }

        if (controllerAcquireDelayMs > 0)
        {
            Thread.Sleep(controllerAcquireDelayMs);
        }

        if (controllerPid <= 0 || controllerPid == wrapperProcessId)
        {
            throw new InvalidOperationException("Invalid controller PID.");
        }
        var controller = Process.GetProcessById(controllerPid);
        if (controller.StartTime.ToFileTimeUtc() != controllerStartFileTime)
        {
            controller.Dispose();
            throw new InvalidOperationException("Controller identity mismatch.");
        }
        var controllerHandle = controller.Handle;

        var job = CreateJobObject(IntPtr.Zero, null);
        if (job == IntPtr.Zero)
        {
            controller.Dispose();
            ThrowLastError("CreateJobObject");
        }

        var limits = new JOBOBJECT_EXTENDED_LIMIT_INFORMATION();
        limits.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
        var limitsSize = Marshal.SizeOf(typeof(JOBOBJECT_EXTENDED_LIMIT_INFORMATION));
        var limitsPointer = Marshal.AllocHGlobal(limitsSize);
        var attributeListSize = UIntPtr.Zero;
        IntPtr attributeList = IntPtr.Zero;
        IntPtr jobListValue = IntPtr.Zero;
        var attributeListInitialized = false;
        PROCESS_INFORMATION processInfo = new PROCESS_INFORMATION();

        try
        {
            Marshal.StructureToPtr(limits, limitsPointer, false);
            if (!SetInformationJobObject(
                job,
                JobObjectExtendedLimitInformation,
                limitsPointer,
                (uint)limitsSize))
            {
                ThrowLastError("SetInformationJobObject");
            }

            InitializeProcThreadAttributeList(IntPtr.Zero, 1, 0, ref attributeListSize);
            attributeList = Marshal.AllocHGlobal(checked((int)attributeListSize.ToUInt64()));
            if (!InitializeProcThreadAttributeList(attributeList, 1, 0, ref attributeListSize))
            {
                ThrowLastError("InitializeProcThreadAttributeList");
            }
            attributeListInitialized = true;

            var controllerWatchdog = new Thread(() =>
            {
                if (WaitForSingleObject(controllerHandle, UInt32.MaxValue) == WAIT_OBJECT_0)
                {
                    TerminateJobObject(job, 1);
                    Environment.Exit(126);
                }
            });
            controllerWatchdog.IsBackground = true;
            controllerWatchdog.Start();
            Console.Error.WriteLine("FDP_JOB_RUNNER_CONTROLLER_WATCHDOG:" + controlToken);

            jobListValue = Marshal.AllocHGlobal(IntPtr.Size);
            Marshal.WriteIntPtr(jobListValue, job);
            if (!UpdateProcThreadAttribute(
                attributeList,
                0,
                PROC_THREAD_ATTRIBUTE_JOB_LIST,
                jobListValue,
                (UIntPtr)IntPtr.Size,
                IntPtr.Zero,
                IntPtr.Zero))
            {
                ThrowLastError("UpdateProcThreadAttribute(PROC_THREAD_ATTRIBUTE_JOB_LIST)");
            }

            var commandLine = new StringBuilder();
            commandLine.Append(QuoteArgument(command));
            foreach (var argument in arguments)
            {
                commandLine.Append(' ');
                commandLine.Append(QuoteArgument(argument));
            }

            var startupInfo = new STARTUPINFOEX();
            startupInfo.StartupInfo.cb = Marshal.SizeOf(typeof(STARTUPINFOEX));
            startupInfo.StartupInfo.dwFlags = STARTF_USESTDHANDLES;
            startupInfo.StartupInfo.hStdInput = GetStdHandle(STD_INPUT_HANDLE);
            startupInfo.StartupInfo.hStdOutput = GetStdHandle(STD_OUTPUT_HANDLE);
            startupInfo.StartupInfo.hStdError = GetStdHandle(STD_ERROR_HANDLE);
            startupInfo.lpAttributeList = attributeList;

            if (!CreateProcess(
                command,
                commandLine,
                IntPtr.Zero,
                IntPtr.Zero,
                true,
                CREATE_SUSPENDED | EXTENDED_STARTUPINFO_PRESENT,
                IntPtr.Zero,
                workingDirectory,
                ref startupInfo,
                out processInfo))
            {
                ThrowLastError("CreateProcess");
            }

            string atomicChildStartedAt;
            using (var atomicChild = Process.GetProcessById((int)processInfo.dwProcessId))
            {
                atomicChildStartedAt = atomicChild.StartTime.ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss.ffffff'0Z'");
            }
            Console.Error.WriteLine("FDP_JOB_RUNNER_ASSIGNED:" + controlToken);
            Console.Error.WriteLine(
                "FDP_JOB_RUNNER_ATOMIC_CHILD:" + controlToken + "|" + processInfo.dwProcessId + "|" + atomicChildStartedAt);
            if (Environment.GetEnvironmentVariable("FDP_JOB_TEST_PAUSE_AFTER_ATOMIC_CREATE") == "1")
            {
                Thread.Sleep(Timeout.Infinite);
            }
            if (ResumeThread(processInfo.hThread) == UInt32.MaxValue)
            {
                ThrowLastError("ResumeThread");
            }

            if (WaitForSingleObject(processInfo.hProcess, UInt32.MaxValue) != WAIT_OBJECT_0)
            {
                ThrowLastError("WaitForSingleObject");
            }

            uint exitCode;
            if (!GetExitCodeProcess(processInfo.hProcess, out exitCode))
            {
                ThrowLastError("GetExitCodeProcess");
            }

            if (!TerminateJobObject(job, 1))
            {
                ThrowLastError("TerminateJobObject");
            }

            if (!WaitForDrain(job, 5000))
            {
                throw new InvalidOperationException("Windows Job Object did not drain before the verification deadline.");
            }

            Console.Error.WriteLine("FDP_JOB_RUNNER_DRAINED:" + controlToken);
            return unchecked((int)exitCode);
        }
        finally
        {
            if (processInfo.hThread != IntPtr.Zero)
            {
                CloseHandle(processInfo.hThread);
            }
            if (processInfo.hProcess != IntPtr.Zero)
            {
                CloseHandle(processInfo.hProcess);
            }
            if (jobListValue != IntPtr.Zero)
            {
                Marshal.FreeHGlobal(jobListValue);
            }
            if (attributeListInitialized)
            {
                DeleteProcThreadAttributeList(attributeList);
            }
            if (attributeList != IntPtr.Zero)
            {
                Marshal.FreeHGlobal(attributeList);
            }
            Marshal.FreeHGlobal(limitsPointer);
            CloseHandle(job);
            controller.Dispose();
        }
    }
}
"@

$controlToken = [string]$env:FDP_JOB_CONTROL_TOKEN
$controllerPidText = [string]$env:FDP_JOB_CONTROLLER_PID
$controllerStartFileTimeText = [string]$env:FDP_JOB_CONTROLLER_START_FILETIME
$controllerAcquireDelayText = [string]$env:FDP_JOB_TEST_CONTROLLER_ACQUIRE_DELAY_MS
[Environment]::SetEnvironmentVariable('FDP_JOB_CONTROL_TOKEN', $null, [EnvironmentVariableTarget]::Process)
[Environment]::SetEnvironmentVariable('FDP_JOB_CONTROLLER_PID', $null, [EnvironmentVariableTarget]::Process)
[Environment]::SetEnvironmentVariable('FDP_JOB_CONTROLLER_START_FILETIME', $null, [EnvironmentVariableTarget]::Process)
[Environment]::SetEnvironmentVariable('FDP_JOB_TEST_CONTROLLER_ACQUIRE_DELAY_MS', $null, [EnvironmentVariableTarget]::Process)

try {
    if ($controlToken -notmatch '^[a-f0-9]{64}$') {
        throw 'Missing or invalid FDP Job control token.'
    }
    $controllerPid = 0
    if (-not [int]::TryParse($controllerPidText, [ref]$controllerPid) -or $controllerPid -le 0) {
        throw 'Missing or invalid FDP Job controller PID.'
    }
    $controllerStartFileTime = 0L
    if (-not [long]::TryParse($controllerStartFileTimeText, [ref]$controllerStartFileTime) -or $controllerStartFileTime -le 0) {
        throw 'Missing or invalid FDP Job controller start FILETIME.'
    }
    $controllerAcquireDelayMs = 0
    if ($env:NODE_ENV -eq 'test' -and $controllerAcquireDelayText -match '^[1-9][0-9]{0,4}$') {
        $controllerAcquireDelayMs = [int]$controllerAcquireDelayText
    }
    Add-Type -TypeDefinition $source -Language CSharp
    $decoded = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($env:FDP_JOB_ARGS_B64))
    $childArgs = [string[]]@()
    if ($decoded -ne '[]') {
        $parsedArgs = ConvertFrom-Json -InputObject $decoded
        $childArgs = [string[]]@($parsedArgs | ForEach-Object { [string]$_ })
    }
    $exitCode = [FdpWindowsJobRunner]::Run(
        $env:FDP_JOB_COMMAND,
        [string[]]$childArgs,
        $env:FDP_JOB_CWD,
        [int]$controllerPid,
        [long]$controllerStartFileTime,
        [int]$controllerAcquireDelayMs,
        $controlToken
    )
    exit [int]$exitCode
} catch {
    [Console]::Error.WriteLine("FDP_JOB_RUNNER_ERROR:$controlToken|$($_.Exception.Message)")
    exit 125
}
