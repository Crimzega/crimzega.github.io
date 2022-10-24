using Modding;
using GlobalEnums;

namespace Sulvic_HK.Handlers{
	
	public class FlowerHandler{
		
		private const float DEFAULT_TIME_RESET = 8.0f;
		private const int DEFAULT_CHANCES = 10, DEFAULT_PROTECTION = 12;
		private bool stillHasProtection;
		private int chancesLeft = DEFAULT_CHANCES, protectionCount = DEFAULT_PROTECTION;
		private PlayerData playerData = PlayerData.instance;
		private float timeReset;
		
		public void Load(){
			ModHooks.Instance.TakeDamageHook += OnDamage;
			ModHooks.Instance.HeroUpdateHook += OnHeroUpdate;
		}
		
		public int OnDamage(ref int hazardType, int damage){
			if((HazardType)hazardType != HazardType.NON_HAZARD) protectionCount -= hazardType + 1;
			return damage;
		}
		
		/// <summary>
		/// The main core for the the flower handler.
		/// Adds protection, chances, and a timer functionality.
		/// </summary>
		public void OnHeroUpdate(){
			/// TODO: Figure out how to tie in player posision, stagways, & dreamgate distance
			if(playerData.hasXunFlower) stillHasProtection = protectionCount > 0;
			if(!stillHasProtection){
				playerData.xunFlowerBroken = !(playerData.hasXunFlower = false);
				chancesLeft--;
				timeReset = DEFAULT_TIME_RESET;
			}
			if(chancesLeft <= 0){
				if(timeReset > 0) timeReset -= 0.0002f;
				else{
					timeReset = DEFAULT_TIME_RESET;
					chancesLeft = DEFAULT_CHANCES;
					protectionCount = DEFAULT_CHANCES;
					stillHasProtection = true;
				}
			}
			/// TODO: Add a timer to the inventory gui
		}
		
		public void Unload(){
			ModHooks.Instance.TakeDamageHook -= OnDamage;
			ModHooks.Instance.HeroUpdateHook -= OnHeroUpdate;
		}
		
	}
	
}
