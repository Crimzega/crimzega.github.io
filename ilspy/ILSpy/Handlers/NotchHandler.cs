using Modding;

namespace Sulvic_HK.Handlers
{
	public class NotchHandler
	{
		private struct NotchList
		{
			public bool fogCanyon;

			public bool grimm;

			public bool shroomOgres;

			public int salubras;

			public int slys;
		}

		private NotchList notches;

		private int trueCount;

		private int resultCount;

		private PlayerData playerDataTemp;

		public NotchHandler()
		{
			notches = default(NotchList);
		}

		private int GetNotchCount()
		{
			return 3 + resultCount;
		}

		private void CheckList()
		{
			if (notches.fogCanyon)
			{
				trueCount++;
			}
			if (notches.shroomOgres)
			{
				trueCount++;
			}
			if (notches.grimm)
			{
				trueCount++;
			}
			trueCount += notches.salubras;
			trueCount += notches.slys;
			resultCount = trueCount;
		}

		private void CheckList(PlayerData data)
		{
			if (playerDataTemp == null)
			{
				playerDataTemp = data;
			}
			notches.fogCanyon = data.notchFogCanyon;
			notches.shroomOgres = data.notchShroomOgres;
			notches.grimm = data.gotGrimmNotch;
			if (data.salubraNotch1)
			{
				notches.salubras++;
			}
			if (data.salubraNotch2)
			{
				notches.salubras++;
			}
			if (data.salubraNotch3)
			{
				notches.salubras++;
			}
			if (data.salubraNotch4)
			{
				notches.salubras++;
			}
			if (data.slyNotch1)
			{
				notches.slys++;
			}
			if (data.slyNotch2)
			{
				notches.slys++;
			}
			CheckList();
		}

		public void Load()
		{
			//IL_000c: Unknown result type (might be due to invalid IL or missing references)
			//IL_0016: Expected O, but got Unknown
			ModHooks.get_Instance().add_CharmUpdateHook((CharmUpdateHandler)(object)new CharmUpdateHandler(OnNotchCollected));
		}

		public void OnNotchCollected(PlayerData data, HeroController controller)
		{
			CheckList(data);
			if (trueCount >= 1)
			{
				resultCount += 2;
			}
			if (trueCount >= 2)
			{
				resultCount++;
			}
			if (trueCount >= 3)
			{
				resultCount++;
			}
			if (trueCount >= 4)
			{
				resultCount++;
			}
			if (trueCount >= 5)
			{
				resultCount++;
			}
			data.SetInt("charmSlots", GetNotchCount());
		}

		public void Unload()
		{
			//IL_002f: Unknown result type (might be due to invalid IL or missing references)
			//IL_0039: Expected O, but got Unknown
			CheckList();
			playerDataTemp.SetInt("charmSlots", GetNotchCount());
			playerDataTemp = null;
			ModHooks.get_Instance().remove_CharmUpdateHook((CharmUpdateHandler)(object)new CharmUpdateHandler(OnNotchCollected));
		}
	}
}
