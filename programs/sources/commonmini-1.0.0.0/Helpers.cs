using System.Runtime.InteropServices;
using System.Text;

internal static class Helpers{

	public static string? ReadLine(this FileStream self){
		StringBuilder builder = new StringBuilder();
		int curr;
		while((curr = self.ReadByte()) != -1){
			char ch = (char)curr;
			if(ch == '\n') break;
			if(ch != '\r') builder.Append(ch);
			else if(RuntimeInformation.IsOSPlatform(OSPlatform.Windows)){
				long pos = self.Position;
				curr = self.ReadByte();
				ch = (char)curr;
				if(ch != '\n') self.Position = pos;
				break;
			}
			else break;
		}
		return builder.Length > 0? builder.ToString(): null;
	}

	public static string? GetUsersPath(this PlatformID self){
		string? path = null;
		switch(self){
			case PlatformID.Unix:
			case PlatformID.MacOSX:
				path = Environment.GetEnvironmentVariable("HOME");
			break;
			default:
				path = Environment.ExpandEnvironmentVariables("%HOMEDRIVE%%HOMEPATH%");
			break;
		}
		DirectoryInfo? dirInfo = null;
		if(path != null) Directory.GetParent(path);
		return dirInfo != null? dirInfo.FullName: null;
	}

	public static void Write(this FileStream self, byte[] buffer) => self.Write(buffer, 0);

	public static void Write(this FileStream self, byte[] buffer, int offset) => self.Write(buffer, offset, buffer.Length - offset);

	public static List<string> GetCorePaths(this PlatformID self){
		List<string> result = new List<string>();
		switch (self)
		{
			case PlatformID.Unix:
			case PlatformID.MacOSX:
				result.Add("/bin/");
				result.Add("/sbin/");
				result.Add("/lib/");
				result.Add("/lib64/");
				result.Add("/etc/");
				result.Add("/boot/");
				break;
			default:
				result.Add("C:\\Windows\\");
				break;
		}
		return result;
	}

	public static List<string> GetExtraCorePaths(this PlatformID self){
		List<string> result = self.GetCorePaths();
		switch(self){
			default:
				result.Add("C:\\Windows\\");
				result.Add("C:\\Program Files\\");
				result.Add("C:\\Program Files (x86)\\");
			break;
		}
		return result;
	}

}
