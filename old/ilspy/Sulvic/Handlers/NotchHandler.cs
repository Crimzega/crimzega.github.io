using Modding;

namespace Sulvic_HK.Handlers{
	
	public class NotchHandler{
		
		private struct NotchList{
			public bool fogCanyon, grimm, shroomOgres;
			public int salubras;
			public int slys;
		}
		
		private NotchList notches;
		private int trueCount = 0, resultCount;
		private PlayerData playerDataTemp;
		
		public NotchHandler(){
			notches = new NotchList();
		}
		
		private int GetNotchCount(){
			return 3 + resultCount;
		}
		
		private void CheckList(){
			if(notches.fogCanyon) trueCount++;
			if(notches.shroomOgres) trueCount++;
			if(notches.grimm) trueCount++;
			trueCount += notches.salubras;
			trueCount += notches.slys;
			resultCount = trueCount;
		}
		
		private void CheckList(PlayerData data){
			if(playerDataTemp == null) playerDataTemp = data;
			notches.fogCanyon = data.notchFogCanyon;
			notches.shroomOgres = data.notchShroomOgres;
			notches.grimm = data.gotGrimmNotch;
			if(data.salubraNotch1) notches.salubras++;
			if(data.salubraNotch2) notches.salubras++;
			if(data.salubraNotch3) notches.salubras++;
			if(data.salubraNotch4) notches.salubras++;
			if(data.slyNotch1) notches.slys++;
			if(data.slyNotch2) notches.slys++;
			CheckList();
		}
		
		public void Load(){
			ModHooks.Instance.CharmUpdateHook += OnNotchCollected;
		}
		
		public void OnNotchCollected(PlayerData data, HeroController controller){
			CheckList(data);
			if(trueCount >= 1) resultCount += 2;
			if(trueCount >= 2) resultCount++;
			if(trueCount >= 3) resultCount++;
			if(trueCount >= 4) resultCount++;
			if(trueCount >= 5) resultCount++;
			data.SetInt("charmSlots", GetNotchCount());
		}
		
		public void Unload(){
			CheckList();
			playerDataTemp.SetInt("charmSlots", GetNotchCount());
			playerDataTemp = null;
			ModHooks.Instance.CharmUpdateHook -= OnNotchCollected;
		}
		
	}
	
}
