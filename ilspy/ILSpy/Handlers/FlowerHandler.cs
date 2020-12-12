using Modding;

namespace Sulvic_HK.Handlers
{
	public class FlowerHandler
	{
		private const float DEFAULT_TIME_RESET = 8f;

		private const int DEFAULT_CHANCES = 10;

		private const int DEFAULT_PROTECTION = 12;

		private bool stillHasProtection;

		private int chancesLeft = 10;

		private int protectionCount = 12;

		private PlayerData playerData = PlayerData.get_instance();

		private float timeReset;

		public void Load()
		{
			//IL_000c: Unknown result type (might be due to invalid IL or missing references)
			//IL_0016: Expected O, but got Unknown
			//IL_0022: Unknown result type (might be due to invalid IL or missing references)
			//IL_002c: Expected O, but got Unknown
			ModHooks.get_Instance().add_TakeDamageHook((TakeDamageProxy)(object)new TakeDamageProxy(OnDamage));
			ModHooks.get_Instance().add_HeroUpdateHook((HeroUpdateHandler)(object)new HeroUpdateHandler(OnHeroUpdate));
		}

		public int OnDamage(ref int hazardType, int damage)
		{
			if (hazardType != 0)
			{
				protectionCount -= hazardType + 1;
			}
			return damage;
		}

		public void OnHeroUpdate()
		{
			if (playerData.hasXunFlower)
			{
				stillHasProtection = (protectionCount > 0);
			}
			if (!stillHasProtection)
			{
				playerData.xunFlowerBroken = !(playerData.hasXunFlower = false);
				chancesLeft--;
				timeReset = 8f;
			}
			if (chancesLeft <= 0)
			{
				if (timeReset > 0f)
				{
					timeReset -= 0.0002f;
					return;
				}
				timeReset = 8f;
				chancesLeft = 10;
				protectionCount = 10;
				stillHasProtection = true;
			}
		}

		public void Unload()
		{
			//IL_000c: Unknown result type (might be due to invalid IL or missing references)
			//IL_0016: Expected O, but got Unknown
			//IL_0022: Unknown result type (might be due to invalid IL or missing references)
			//IL_002c: Expected O, but got Unknown
			ModHooks.get_Instance().remove_TakeDamageHook((TakeDamageProxy)(object)new TakeDamageProxy(OnDamage));
			ModHooks.get_Instance().remove_HeroUpdateHook((HeroUpdateHandler)(object)new HeroUpdateHandler(OnHeroUpdate));
		}
	}
}
