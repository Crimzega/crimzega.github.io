using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Sulvic.Common.Mini;

internal class Program{

	private const long MAX_CHUNK_SIZE = 0x1000L;

	private static void ChunkWipeFile(FileStream stream){
		long fileLength = stream.Length;
		int numChunks = (int)Math.Ceiling((double)fileLength / MAX_CHUNK_SIZE);
		Parallel.For(0, numChunks, chunkIndex => {
			long offset = chunkIndex * MAX_CHUNK_SIZE;
			int chunkSize = (int)Math.Min(MAX_CHUNK_SIZE, fileLength - offset);
			byte[] buffer = new byte[chunkSize];
			lock(stream){
				stream.Position = offset;
				stream.Write(buffer);
			}
		});
	}

	private static void Main(string[] args){
		Blacklister.Compile();
		string currDir = Environment.CurrentDirectory;
		if(Blacklister.InBlacklistedPath(currDir)){
			Console.WriteLine("The current working path is blacklisted. Exiting...");
			return;
		}
		if(args.Length == 0){
			Console.WriteLine("No arguments were passed for the program to work.");
			Console.WriteLine("Usage: ZOut <FileWildcard> [MaxDepth]");
			return;
		}
		string wildcard = args[0];
		if(string.IsNullOrEmpty(wildcard)){
			Console.WriteLine("Could not run ZOut. Missing file wildcard value.");
			return;
		}
		int num, maxDepth = args.Length > 1 && int.TryParse(args[1], out num) ? num : int.MaxValue;
		List<string> excludedFiles = new List<string>();
		List<string> fileNames = FileCollector.GetWritableFiles(currDir, wildcard, maxDepth);
		WipeFiles(fileNames);
		if(FileCollector.HasExcludedFiles()){
			Console.WriteLine("The following list of files could not be wiped due to being used in another process:");
			foreach (string file in FileCollector.GetExcludedFiles()) Console.WriteLine($"\t{file}");
			Console.WriteLine("Press any key to continue...");
			while(!Console.KeyAvailable) Thread.Sleep(100);
			Console.ReadKey();
		}

	}

	private static void WipeFiles(List<string> files){
		Parallel.ForEach(files, file => {
			try{
				using(FileStream stream = File.Open(file, FileMode.Open, FileAccess.Write)){
					if(stream.Length > MAX_CHUNK_SIZE) ChunkWipeFile(stream);
					else{
						byte[] buffer = new byte[stream.Length];
						stream.Write(buffer, 0, buffer.Length);
					}
					stream.Flush();
				}
				Console.WriteLine($"Cleaned Original contents of ${file}");
			}
			catch(Exception ex){
				Console.WriteLine($"Error while wiping file \"{file}\": {ex.Message}");
			}
		});
	}

}
