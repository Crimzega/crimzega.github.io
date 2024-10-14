using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using Sulvic.Common.Mini;

internal class Program{

	private static void DeleteFiles(List<string> files){
		foreach(string file in files){
			File.Delete(file);
			Console.WriteLine($"Deleting: \"{file}\"");
		}
	}

	static void Main(string[] args){
		Blacklister.Compile();
		string currDir = Environment.CurrentDirectory;
		if(Blacklister.InBlacklistedPath(currDir)){
			Console.WriteLine("The current working directory path is blacklisted. Exiting...");
			return;
		}
		if(args.Length == 0){
			Console.WriteLine("No arguments were passed for the program to work.");
			Console.WriteLine("Usage: MassDel <FileWildcard> [MaxDepth]");
			return;
		}
		string wildcard = args[0];
		if(string.IsNullOrEmpty(wildcard)){
			Console.WriteLine("Could not run MassDel. Missinf file wildcard value.");
			return;
		}
		int num, maxDepth = args.Length > 1 && int.TryParse(args[1], out num)? num: int.MaxValue;
		List<string> fileNames = FileCollector.GetWritableFiles(currDir, wildcard, maxDepth);
		DeleteFiles(fileNames);
		if(FileCollector.HasExcludedFiles()){
			Console.WriteLine("The following list of files could not be deleted due to being used by another process:");
			foreach(string file in FileCollector.GetExcludedFiles()) Console.WriteLine($"\t{file}");
			Console.WriteLine("Press any key to continue...");
			while(!Console.KeyAvailable) Thread.Sleep(100);
			Console.ReadKey();
		}
	}

}
