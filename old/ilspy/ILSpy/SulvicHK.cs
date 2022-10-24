using Modding;
using Sulvic_HK.Handlers;

namespace Sulvic_HK
{
	public class SulvicHK : Mod, ITogglableMod, IMod, ILogger
	{
		private static GameManager gameInstance = GameManager.get_instance();

		internal static SulvicHK instance = new SulvicHK("HK: Sulvic Mod");

		private FlowerHandler flowerHandler;

		private NotchHandler notchHandler;

		public SulvicHK(string name)
			: this(name)
		{
			flowerHandler = new FlowerHandler();
			notchHandler = new NotchHandler();
		}

		public override string GetVersion()
		{
			return "1.0.0";
		}

		public override void Initialize()
		{
			instance = this;
			flowerHandler.Load();
			notchHandler.Load();
		}

		public void Unload()
		{
			flowerHandler.Unload();
			notchHandler.Unload();
		}
	}
}
