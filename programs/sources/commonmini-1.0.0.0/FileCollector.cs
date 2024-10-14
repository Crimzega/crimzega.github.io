internal class FileCollector{

	public static bool IsFileAvailable(string file){
		try{
			using(FileStream stream = File.Open(file, FileMode.Open, FileAccess.Read, FileShare.None)) stream.Close();
			return true;
		}
		catch(Exception){
			return false;
		}
	}

	public static List<string>? GetWritableFiles(string path, string wildcard, int depth, ref List<string> excluded){
		if(depth < 0) return null;
		List<string> result = new List<string>();
		try{
			string[] files = Directory.GetFiles(path, wildcard);
			foreach(string file in files){
				if(IsFileAvailable(file)) result.Add(file);
				else excluded.Add(file);
			}
			foreach(string path1 in Directory.GetDirectories(path)) if(!Blacklister.InBlacklistedPath(path1)){
				List<string>? files1 = GetWritableFiles(path1, wildcard, depth - 1, ref excluded);
				if(files1 != null) result.AddRange(files1);
			}
		}
		catch(UnauthorizedAccessException ex){
			Console.WriteLine($"Access to directory \"{path} is denied: {ex.Message}");
		}
		catch(PathTooLongException ex){
			Console.WriteLine($"Path too long for \"{path}: {ex.Message}");
		}
		return result;
	}

}
