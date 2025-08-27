import { testData, testUtils } from '../../setup';
import { User } from '../../../src/models/User';

describe('User Model', () => {
  describe('Создание пользователя', () => {
    it('должен создать пользователя с валидными данными', async () => {
      const user = new User(testData.users.valid);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.steamId).toBe(testData.users.valid.steamId);
      expect(savedUser.steamProfile.displayName).toBe(testData.users.valid.steamProfile.displayName);
      expect(savedUser.balance).toBe(testData.users.valid.balance);
      expect(savedUser.referralCode).toBeDefined();
      expect(savedUser.referralCode).toHaveLength(8);
    });

    it('должен генерировать уникальный referral код', async () => {
      const user1 = new User(testData.users.valid);
      const user2 = new User({
        ...testData.users.valid,
        steamId: '76561198037414412'
      });

      const savedUser1 = await user1.save();
      const savedUser2 = await user2.save();

      expect(savedUser1.referralCode).not.toBe(savedUser2.referralCode);
    });

    it('должен требовать steamId', async () => {
      const user = new User({
        steamProfile: testData.users.valid.steamProfile,
        balance: testData.users.valid.balance
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('должен требовать steamProfile', async () => {
      const user = new User({
        steamId: testData.users.valid.steamId,
        balance: testData.users.valid.balance
      });

      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Методы баланса', () => {
    let user: any;

    beforeEach(async () => {
      user = await testUtils.createTestUser();
    });

    describe('checkBalance', () => {
      it('должен возвращать true для достаточного баланса', () => {
        const result = user.checkBalance(50);
        
        expect(result.hasEnough).toBe(true);
        expect(result.currentBalance).toBe(100);
        expect(result.requiredAmount).toBe(50);
        expect(result.shortfall).toBe(0);
      });

      it('должен возвращать false для недостаточного баланса', () => {
        const result = user.checkBalance(150);
        
        expect(result.hasEnough).toBe(false);
        expect(result.currentBalance).toBe(100);
        expect(result.requiredAmount).toBe(150);
        expect(result.shortfall).toBe(50);
      });
    });

    describe('validateBalanceForPurchase', () => {
      it('не должен выбрасывать ошибку для достаточного баланса', () => {
        expect(() => user.validateBalanceForPurchase(50)).not.toThrow();
      });

      it('должен выбрасывать ошибку для недостаточного баланса', () => {
        expect(() => user.validateBalanceForPurchase(150)).toThrow('Insufficient balance');
      });

      it('должен включать детали в ошибку', () => {
        try {
          user.validateBalanceForPurchase(150);
        } catch (error: any) {
          expect(error.details).toBeDefined();
          expect(error.details.currentBalance).toBe(100);
          expect(error.details.requiredAmount).toBe(150);
          expect(error.details.shortfall).toBe(50);
        }
      });
    });

    describe('updateBalance', () => {
      it('должен увеличивать баланс', async () => {
        await user.updateBalance(50);
        expect(user.balance).toBe(150);
      });

      it('должен уменьшать баланс', async () => {
        await user.updateBalance(-30);
        expect(user.balance).toBe(70);
      });

      it('не должен позволять отрицательный баланс', async () => {
        await user.updateBalance(-150);
        expect(user.balance).toBe(0);
      });
    });

    describe('safeDeductBalance', () => {
      it('должен списывать средства при достаточном балансе', async () => {
        await user.safeDeductBalance(50);
        expect(user.balance).toBe(50);
      });

      it('должен выбрасывать ошибку при недостаточном балансе', async () => {
        await expect(user.safeDeductBalance(150)).rejects.toThrow('Insufficient balance');
        expect(user.balance).toBe(100); // Баланс не должен измениться
      });
    });

    describe('addReferralEarnings', () => {
      it('должен добавлять реферальные доходы', async () => {
        await user.addReferralEarnings(25);
        expect(user.referralEarnings).toBe(25);
      });
    });
  });

  describe('Виртуальные поля', () => {
    it('должен вычислять totalEarnings', async () => {
      const user = await testUtils.createTestUser({
        ...testData.users.valid,
        balance: 100
      });
      
      // Добавляем referralEarnings через метод
      await user.addReferralEarnings(50);

      expect(user.totalEarnings).toBe(150);
    });
  });

  describe('Статические методы', () => {
    beforeEach(async () => {
      await testUtils.createTestUser();
    });

    it('должен находить пользователя по Steam ID', async () => {
      const user = await User.findBySteamId(testData.users.valid.steamId);
      expect(user).toBeDefined();
      expect(user?.steamId).toBe(testData.users.valid.steamId);
    });

    it('должен находить пользователя по referral коду', async () => {
      const user = await testUtils.createTestUser({
        ...testData.users.valid,
        steamId: `7656119803741441${Math.floor(Math.random() * 1000)}`
      });
      const foundUser = await User.findByReferralCode(user.referralCode);
      expect(foundUser).toBeDefined();
      expect(foundUser?.referralCode).toBe(user.referralCode);
    });
  });
});
