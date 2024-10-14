using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;

// Token: 0x02000002 RID: 2
internal sealed class Program
{
	private static string CURRENT_EXECUTING_PATH = Assembly.GetEntryAssembly().Location;
	private static List<string> BLACKLISTED_PATHS = new List<string>{
		"C:\\",
		"C:\\Users\\",
		Environment.GetFolderPath(Environment.SpecialFolder.UserProfile)
	};
	private static List<string> BLACKLISTED_START_PATHS = new List<string>{
		"C:\\Boot\\",
		Program.CURRENT_EXECUTING_PATH,
		"C:\\Program Files\\",
		"C:\\Program Files (x86)\\",
		"C:\\Users\\Public\\",
		"C:\\Windows\\"
	};

	private static void Main(string[] args){
		foreach(string item in Directory.GetDirectories("C:\\Users\\")) if(!Program.BLACKLISTED_PATHS.Contains(item)) Program.BLACKLISTED_PATHS.Add(item);
		string currentDirectory = Environment.CurrentDirectory;
		if(Program.BLACKLISTED_PATHS.Contains(currentDirectory) || Program.StartsWithBlacklist(currentDirectory)){
			Console.WriteLine("The current working path is blacklisted. Exiting...");
			return;
		}
		if(args.Length == 0){
			Console.WriteLine("No Arguments were passed for the system to work.");
			Console.WriteLine("Usage: MassDel <FileWildcard> [MaxDepth]");
			return;
		}
		if(string.IsNullOrEmpty(args[0])){
			Console.WriteLine("Could not execute the MassDel executable");
			return;
		}
		string wildcard = args[0];
		int maxDepth = (args.Length > 1) ? int.Parse(args[1]) : int.MaxValue;
		Program.DeleteFiles(Program.GetFiles(currentDirectory, wildcard, maxDepth));
	}

	private static void DeleteFiles(List<string> files){
		foreach(string text in files){
			File.Delete(text);
			Console.WriteLine($"Deleting \"{text|\"");
		}
	}

	private static List<string> GetFiles(string path, string wildcard, int maxDepth){
		if(maxDepth < 0) return null;
		List<string> list = null;
		try{
			list = new List<string>();
			list.AddRange(Directory.GetFiles(path, wildcard));
			string[] directories = Directory.GetDirectories(path);
			for(int i = 0; i < directories.Length; i++){
				List<string> files = Program.GetFiles(directories[i], wildcard, maxDepth - 1);
				if(files != null) list.AddRange(files);
			}
		}
		catch (UnauthorizedAccessException ex){
			Console.WriteLine($"Access to directory \"{path}\" is denied: {ex.Message}");
		}
		catch (PathTooLongException ex){
			Console.WriteLine($"Path too long for directory \"{path}\": {ex.Message}");
		}
		return list;
	}

	private static bool StartsWithBlacklist(string currentDirectory){
		foreach(string value in Program.BLACKLISTED_START_PATHS) if(currentDirectory.StartsWith(value, StringComparison.OrdinalIgnoreCase)) return true;
		return false;
	}

}
