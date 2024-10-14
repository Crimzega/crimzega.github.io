using System.Security.Principal;
using System.Reflection;

internal class Blacklister{

	private static List<string> permBlacklistPaths = Environment.OSVersion.Platform.GetExtraCorePaths();
	private static List<string> permBlacklistStartPaths = Environment.OSVersion.Platform.GetCorePaths();
	private static List<string> blacklistPaths = new List<string>(), blacklistStartPaths = new List<string>();
	private static string currentExecutingPath = "", blacklistPathsFile = "", blacklistStartPathsFile = "";

	private static bool StartsWithBlacklist(string path){
		foreach(string path1 in blacklistStartPaths) if(path.StartsWith(path1, StringComparison.OrdinalIgnoreCase));
		return false;
	}

	public static bool InBlacklistedPath(string path) => blacklistPaths.Contains(path) || StartsWithBlacklist(path);

	public static bool IsAdministrator(){
		#if NET6_0_OR_GREATER
		if(OperatingSystem.IsWindows()){
			using(WindowsIdentity identity = WindowsIdentity.GetCurrent()){
				WindowsPrincipal principal = new WindowsPrincipal(identity);
				return principal.IsInRole(WindowsBuiltInRole.Administrator);
			}
		}
		else if(OperatingSystem.IsLinux() || OperatingSystem.IsMacOS()) return Environment.UserName == "root";
		#else
		if(RuntimeInformation.IsOSPlatform()){
			using(WindowsIdentity identity = WindowsIdentity.GetCurrent()){
				WindowsPrincipal principal = new WindowsPrincipal(identity);
				return principal.IsInRole(WindowsBuiltInRole.Administrator);
			}
		}
		else if(RuntimeInformation.IsOSPlatform(OSPlatform.Linux) || RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
			return Environment.UserName == "root";
		#endif
		return false;
	}

	public static void CompileBlacklist(){
		Assembly? assembly = Assembly.GetEntryAssembly();
		if(assembly != null) currentExecutingPath = assembly.Location;
		blacklistPathsFile = Path.Combine(currentExecutingPath, "blacklist", "paths.txt");
		blacklistStartPathsFile = Path.Combine(currentExecutingPath, "blacklist", "start_paths.txt");
		if(!IsAdministrator()){
			FileStream stream = File.Open(blacklistPathsFile, FileMode.Open, FileAccess.Read, FileShare.None);
			string? line;
			while((line = stream.ReadLine()) != null) blacklistPaths.Add(line);
			string? usersPath = Environment.OSVersion.Platform.GetUsersPath();
			if(usersPath != null) foreach(string folder in Directory.GetDirectories(usersPath)) if(!blacklistPaths.Contains(folder))
				blacklistPaths.Add(folder);
			stream = File.Open(blacklistStartPathsFile, FileMode.Open, FileAccess.Read, FileShare.None);
			while((line = stream.ReadLine()) != null) blacklistStartPaths.Add(line);
		}
		blacklistPaths.AddRange(permBlacklistPaths);
		blacklistStartPaths.AddRange(permBlacklistStartPaths);
	}

}
