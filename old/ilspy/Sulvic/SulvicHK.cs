using Modding;
using Sulvic_HK.Handlers;

namespace Sulvic_HK{
	
	public class SulvicHK: Mod, ITogglableMod{
		
		private static GameManager gameInstance = GameManager.instance;
		internal static SulvicHK instance = new SulvicHK("HK: Sulvic Mod");
		private FlowerHandler flowerHandler;
		private NotchHandler notchHandler;
		
		public SulvicHK(string name): base(name){
			flowerHandler = new FlowerHandler();
			notchHandler = new NotchHandler();
		}
		
		public override string GetVersion() => "1.0.0";
		
		public override void Initialize(){
			flowerHandler.Load();
			notchHandler.Load();
		}
		
		public void Unload(){
			flowerHandler.Unload();
			notchHandler.Unload();
		}
		
	}
	
}
