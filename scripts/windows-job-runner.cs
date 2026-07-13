using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Diagnostics;
using System.Text;
using System.Threading;

public static class FdpWindowsJobRunner
{
    private const uint CREATE_SUSPENDED = 0x00000004;
    private const uint CREATE_NO_WINDOW = 0x08000000;
    private const uint EXTENDED_STARTUPINFO_PRESENT = 0x00080000;
    private const uint STARTF_USESTDHANDLES = 0x00000100;
    private static readonly IntPtr PROC_THREAD_ATTRIBUTE_JOB_LIST = new IntPtr(0x0002000D);
    private const uint JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x00002000;
    private const int JobObjectBasicAccountingInformation = 1;
    private const int JobObjectExtendedLimitInformation = 9;
    private const uint WAIT_OBJECT_0 = 0;
    private const uint PROCESS_QUERY_LIMITED_INFORMATION = 0x00001000;
    private const uint SYNCHRONIZE = 0x00100000;
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
    private static extern uint WaitForMultipleObjects(
        uint nCount,
        [In] IntPtr[] lpHandles,
        bool bWaitAll,
        uint dwMilliseconds);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr CreateEvent(
        IntPtr lpEventAttributes,
        bool bManualReset,
        bool bInitialState,
        string lpName);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool SetEvent(IntPtr hEvent);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr OpenProcess(uint dwDesiredAccess, bool bInheritHandle, uint dwProcessId);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetProcessTimes(
        IntPtr hProcess,
        out System.Runtime.InteropServices.ComTypes.FILETIME lpCreationTime,
        out System.Runtime.InteropServices.ComTypes.FILETIME lpExitTime,
        out System.Runtime.InteropServices.ComTypes.FILETIME lpKernelTime,
        out System.Runtime.InteropServices.ComTypes.FILETIME lpUserTime);

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

    private static long FileTimeToLong(System.Runtime.InteropServices.ComTypes.FILETIME value)
    {
        return ((long)(uint)value.dwHighDateTime << 32) | (uint)value.dwLowDateTime;
    }

    private static IntPtr OpenVerifiedControllerProcess(int controllerPid, long controllerStartFileTime)
    {
        var controllerHandle = OpenProcess(
            SYNCHRONIZE | PROCESS_QUERY_LIMITED_INFORMATION,
            false,
            checked((uint)controllerPid));
        if (controllerHandle == IntPtr.Zero)
        {
            ThrowLastError("OpenProcess(controller)");
        }

        try
        {
            System.Runtime.InteropServices.ComTypes.FILETIME creationTime;
            System.Runtime.InteropServices.ComTypes.FILETIME exitTime;
            System.Runtime.InteropServices.ComTypes.FILETIME kernelTime;
            System.Runtime.InteropServices.ComTypes.FILETIME userTime;
            if (!GetProcessTimes(
                controllerHandle,
                out creationTime,
                out exitTime,
                out kernelTime,
                out userTime))
            {
                ThrowLastError("GetProcessTimes(controller)");
            }

            if (FileTimeToLong(creationTime) != controllerStartFileTime)
            {
                throw new InvalidOperationException("Controller identity mismatch.");
            }

            return controllerHandle;
        }
        catch
        {
            CloseHandle(controllerHandle);
            throw;
        }
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

    private static uint GetActiveProcessCount(IntPtr job)
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

        return accounting.ActiveProcesses;
    }

    private static bool WaitForDrain(IntPtr job, int timeoutMs)
    {
        var stopwatch = Stopwatch.StartNew();
        do
        {
            if (GetActiveProcessCount(job) == 0)
            {
                return true;
            }

            Thread.Sleep(25);
        }
        while (stopwatch.ElapsedMilliseconds < timeoutMs);

        return false;
    }

    private static bool IsLowerHexToken(string value)
    {
        if (String.IsNullOrEmpty(value) || value.Length != 64)
        {
            return false;
        }

        foreach (var character in value)
        {
            if (!((character >= '0' && character <= '9') || (character >= 'a' && character <= 'f')))
            {
                return false;
            }
        }

        return true;
    }

    public static int Main(string[] args)
    {
        var controlToken = Environment.GetEnvironmentVariable("FDP_JOB_CONTROL_TOKEN") ?? String.Empty;
        var controllerPidText = Environment.GetEnvironmentVariable("FDP_JOB_CONTROLLER_PID") ?? String.Empty;
        var controllerStartFileTimeText = Environment.GetEnvironmentVariable("FDP_JOB_CONTROLLER_START_FILETIME") ?? String.Empty;
        var controllerAcquireDelayText = Environment.GetEnvironmentVariable("FDP_JOB_TEST_CONTROLLER_ACQUIRE_DELAY_MS") ?? String.Empty;
        var setupDelayText = Environment.GetEnvironmentVariable("FDP_JOB_TEST_SETUP_DELAY_MS") ?? String.Empty;
        var setupReadyFile = Environment.GetEnvironmentVariable("FDP_JOB_TEST_SETUP_READY_FILE") ?? String.Empty;
        Environment.SetEnvironmentVariable("FDP_JOB_CONTROL_TOKEN", null);
        Environment.SetEnvironmentVariable("FDP_JOB_CONTROLLER_PID", null);
        Environment.SetEnvironmentVariable("FDP_JOB_CONTROLLER_START_FILETIME", null);
        Environment.SetEnvironmentVariable("FDP_JOB_TEST_CONTROLLER_ACQUIRE_DELAY_MS", null);
        Environment.SetEnvironmentVariable("FDP_JOB_TEST_SETUP_DELAY_MS", null);
        Environment.SetEnvironmentVariable("FDP_JOB_TEST_SETUP_READY_FILE", null);

        try
        {
            if (!IsLowerHexToken(controlToken))
            {
                throw new InvalidOperationException("Missing or invalid FDP Job control token.");
            }
            if (args == null || args.Length < 2 || String.IsNullOrEmpty(args[0]) || String.IsNullOrEmpty(args[1]))
            {
                throw new InvalidOperationException("Missing Windows Job runner command or working directory.");
            }

            int controllerPid;
            if (!Int32.TryParse(controllerPidText, out controllerPid) || controllerPid <= 0)
            {
                throw new InvalidOperationException("Missing or invalid FDP Job controller PID.");
            }
            long controllerStartFileTime;
            if (!Int64.TryParse(controllerStartFileTimeText, out controllerStartFileTime)
                || controllerStartFileTime <= 0)
            {
                throw new InvalidOperationException("Missing or invalid FDP Job controller start FILETIME.");
            }

            var controllerAcquireDelayMs = 0;
            if (Environment.GetEnvironmentVariable("NODE_ENV") == "test"
                && !String.IsNullOrEmpty(controllerAcquireDelayText)
                && (!Int32.TryParse(controllerAcquireDelayText, out controllerAcquireDelayMs)
                    || controllerAcquireDelayMs <= 0
                    || controllerAcquireDelayMs > 99999))
            {
                throw new InvalidOperationException("Invalid controller acquisition test delay.");
            }

            var setupDelayMs = 0;
            if (Environment.GetEnvironmentVariable("NODE_ENV") == "test"
                && !String.IsNullOrEmpty(setupDelayText))
            {
                if (!Int32.TryParse(setupDelayText, out setupDelayMs)
                    || setupDelayMs <= 0
                    || setupDelayMs > 30000
                    || String.IsNullOrEmpty(setupReadyFile)
                    || !System.IO.Path.IsPathRooted(setupReadyFile))
                {
                    throw new InvalidOperationException("Invalid pre-run setup delay test configuration.");
                }
                System.IO.File.WriteAllText(setupReadyFile, Process.GetCurrentProcess().Id.ToString());
                Thread.Sleep(setupDelayMs);
            }

            var childArguments = new string[args.Length - 2];
            if (childArguments.Length > 0)
            {
                Array.Copy(args, 2, childArguments, 0, childArguments.Length);
            }
            return Run(
                args[0],
                childArguments,
                args[1],
                controllerPid,
                controllerStartFileTime,
                controllerAcquireDelayMs,
                controlToken);
        }
        catch (Exception error)
        {
            Console.Error.WriteLine("FDP_JOB_RUNNER_ERROR:" + controlToken + "|" + error.Message);
            return 125;
        }
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

        var watchdogCancelDelayMs = 0;
        var watchdogCancelDelayText = Environment.GetEnvironmentVariable("FDP_JOB_TEST_WATCHDOG_CANCEL_DELAY_MS");
        Environment.SetEnvironmentVariable("FDP_JOB_TEST_WATCHDOG_CANCEL_DELAY_MS", null);
        if (Environment.GetEnvironmentVariable("NODE_ENV") == "test"
            && !String.IsNullOrEmpty(watchdogCancelDelayText)
            && (!Int32.TryParse(watchdogCancelDelayText, out watchdogCancelDelayMs)
                || watchdogCancelDelayMs < 0
                || watchdogCancelDelayMs > 5000))
        {
            throw new InvalidOperationException("Invalid watchdog cancellation test delay.");
        }

        var controllerHandle = OpenVerifiedControllerProcess(controllerPid, controllerStartFileTime);

        var job = CreateJobObject(IntPtr.Zero, null);
        if (job == IntPtr.Zero)
        {
            CloseHandle(controllerHandle);
            ThrowLastError("CreateJobObject");
        }

        var limits = new JOBOBJECT_EXTENDED_LIMIT_INFORMATION();
        limits.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
        var limitsSize = Marshal.SizeOf(typeof(JOBOBJECT_EXTENDED_LIMIT_INFORMATION));
        var limitsPointer = Marshal.AllocHGlobal(limitsSize);
        var attributeListSize = UIntPtr.Zero;
        IntPtr attributeList = IntPtr.Zero;
        IntPtr jobListValue = IntPtr.Zero;
        IntPtr watchdogCancellation = IntPtr.Zero;
        var attributeListInitialized = false;
        Thread controllerWatchdog = null;
        var controllerWatchdogStarted = false;
        PROCESS_INFORMATION processInfo = new PROCESS_INFORMATION();

        try
        {
            watchdogCancellation = CreateEvent(IntPtr.Zero, true, false, null);
            if (watchdogCancellation == IntPtr.Zero)
            {
                ThrowLastError("CreateEvent(watchdog cancellation)");
            }

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

            controllerWatchdog = new Thread(() =>
            {
                var waitResult = WaitForMultipleObjects(
                    2,
                    new[] { controllerHandle, watchdogCancellation },
                    false,
                    UInt32.MaxValue);
                if (waitResult == WAIT_OBJECT_0)
                {
                    TerminateJobObject(job, 1);
                    Environment.Exit(126);
                }
                if (waitResult == WAIT_OBJECT_0 + 1)
                {
                    if (watchdogCancelDelayMs > 0)
                    {
                        Thread.Sleep(watchdogCancelDelayMs);
                    }
                    Console.Error.WriteLine("FDP_JOB_RUNNER_CONTROLLER_WATCHDOG_STOPPED:" + controlToken);
                    return;
                }

                Environment.Exit(126);
            });
            controllerWatchdog.IsBackground = true;
            controllerWatchdog.Start();
            controllerWatchdogStarted = true;
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
                CREATE_SUSPENDED | CREATE_NO_WINDOW | EXTENDED_STARTUPINFO_PRESENT,
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

            var activeProcessesAfterRootExit = GetActiveProcessCount(job);
            if (!TerminateJobObject(job, 1))
            {
                ThrowLastError("TerminateJobObject");
            }

            if (!WaitForDrain(job, 5000))
            {
                throw new InvalidOperationException("Windows Job Object did not drain before the verification deadline.");
            }

            Console.Error.WriteLine("FDP_JOB_RUNNER_DRAINED:" + controlToken);
            if (activeProcessesAfterRootExit > 0)
            {
                throw new InvalidOperationException(
                    "Worker root exited while " + activeProcessesAfterRootExit + " Job process(es) remained active.");
            }
            return unchecked((int)exitCode);
        }
        finally
        {
            if (controllerWatchdogStarted)
            {
                if (!SetEvent(watchdogCancellation))
                {
                    ThrowLastError("SetEvent(watchdog cancellation)");
                }
                if (!controllerWatchdog.Join(5000))
                {
                    throw new InvalidOperationException(
                        "Controller watchdog did not stop before native handle teardown.");
                }
            }

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
            if (watchdogCancellation != IntPtr.Zero)
            {
                CloseHandle(watchdogCancellation);
            }
            CloseHandle(job);
            CloseHandle(controllerHandle);

        }
    }
}
