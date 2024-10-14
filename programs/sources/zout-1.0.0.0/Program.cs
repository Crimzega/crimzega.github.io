using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;

internal class Program{

	private const int CHUNK_SIZE = 4000;
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

	private static bool StartsWithBlacklist(string currentDirectory){
		foreach(string value in Program.BLACKLISTED_START_PATHS) if(currentDirectory.StartsWith(value, StringComparison.OrdinalIgnoreCase)) return true;
		return false;
	}

	private static List<string> GetFiles(string path, string wildcard, int maxDepth){
		if(maxDepth < 0) return null;
		List<string> list = new List<string>();
		try{
			list.AddRange(Directory.GetFiles(path, wildcard));
			foreach(string text in Directory.GetDirectories(path)){
				if(!Program.BLACKLISTED_PATHS.Contains(text)){
					List<string> files = Program.GetFiles(text, wildcard, maxDepth - 1);
					if(files != null) list.AddRange(files);
				}
			}
		}
		catch(UnauthorizedAccessException ex){
			Console.WriteLine($"Access to directory \"{path}\" is denied: {ex.Message}");
		}
		catch (PathTooLongException ex){
			Console.WriteLine($"Path too long for directory \"{path}\": {ex.Message}");
		}
		return list;
	}

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
		if(args.Length > 1){
			bool flag;
			bool.TryParse(args[1], out flag);
		}
		int num;
		int maxDepth = (args.Length > 2 && int.TryParse(args[2], out num))? num: int.MaxValue;
		Program.WipeFiles(Program.GetFiles(currentDirectory, wildcard, maxDepth));
	}

	private static void WipeFiles(List<string> files){
		foreach(string text in files){
			try{
				using(FileStream fileStream = File.Open(text, FileMode.Open, FileAccess.Write)){
					if(fileStream.Length > (long)CHUNK_SIZE) Program.WipeFileChunked(fileStream);
					else{
						byte[] array = new byte[fileStream.Length];
						fileStream.Write(array, 0, array.Length);
					}
					fileStream.Flush();
				}
				Console.WriteLine($"Cleaned original contents of: {text}");
			}
			catch(Exception ex){
				Console.WriteLine($"Error while processing file \"{text}\": {ex.Message}");
			}
		}
	}

	private static void WipeFileChunked(FileStream stream){
		byte[] buffer = new byte[CHUNK_SIZE];
		int num2;
		for(long num = stream.Length; num > 0L; num -= (long)num2){
			num2 = (int)Math.Min((long)CHUNK_SIZE, num);
			stream.Write(buffer, 0, num2);
		}
	}

}
