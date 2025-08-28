<template>
  <div class="me">
    <div class="me__header">
      <UserCard :user="USER" />
      <CardBase class="me__hint">
        <div class="me__hint-title">Настройки</div>
        <div class="me__hint-description">
          В этом разделе вы найдете информацию о вашей учётной записи ваш
          URL-адрес для обмена и другие данные актуальны.
        </div>
      </CardBase>
    </div>
    <LabelWrapper title="Ссылка для обмена">
      <template v-slot:label-helper>
        <a
          class="me__trade-link"
          target="_blank"
          href="http://steamcommunity.com/my/tradeoffers/privacy"
          >Найти ссылку для обмена</a
        >
        <a
          class="me__trade-link-mobile"
          target="_blank"
          href="http://steamcommunity.com/my/tradeoffers/privacy"
          ><Icon name="transparent_steam"
        /></a>
      </template>
      <Field
        v-model="tradeUrl"
        variant="gray"
        padding="md-2"
        :text="dt === 'desktop' ? 'md-2' : 'md-3'"
        radius="lg"
        name="trade-link"
        :disabled="tradeDisabled"
      >
        <template v-slot:right>
          <Icon
            @click="tradeDisabled = !tradeDisabled"
            class="me__field-edit"
            :name="tradeDisabled ? 'edit-2' : 'tick-circle'"
          />
        </template>
      </Field>
    </LabelWrapper>
    <LabelWrapper title="Электронная почта">
      <template v-slot:label-helper>
        <div class="me__email-status">Подтверждена</div>
        <div class="me__email-status-mobile"><Icon name="tick-circle" /></div>
      </template>
      <Field
        v-model="email"
        variant="gray"
        padding="md-2"
        :text="dt === 'desktop' ? 'md-2' : 'md-3'"
        radius="lg"
        name="email"
        :disabled="emailDisabled"
      >
        <template v-slot:right>
          <Icon
            @click="emailDisabled = !emailDisabled"
            class="me__field-edit"
            :name="emailDisabled ? 'edit-2' : 'tick-circle'"
          />
        </template>
      </Field>
    </LabelWrapper>
    <LabelWrapper title="Связанные аккаунты">
      <AccountCard type="steam" name="boboie" />
    </LabelWrapper>
  </div>
</template>

<script lang="ts" setup>
import UserCard from '@/components/Profile/Me/UserCard.vue'
import CardBase from '@/components/Profile/CardBase.vue'
import LabelWrapper from '@/components/Profile/LabelWrapper.vue'
import Field from '@/components/UI/Field.vue'
import { ref } from 'vue'
import Icon from '@/components/UI/Icon.vue'
import AccountCard from '@/components/Profile/Me/AccountCard.vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'

const USER = {
  name: 'boboie',
  steamId: '76561199851054801',
  avatarUrl: 'https://i.pravatar.cc/300',
}
const tradeUrl = ref(
  'https://steamcommunity.com/tradeoffer/new/?partner=1008452712&token=T_g4LZ17'
)
const tradeDisabled = ref(true)
const email = ref('foo@bar.com')
const emailDisabled = ref(true)
const dt = useDeviceType()
</script>

<style lang="scss" scoped>
.me {
  @include flex(column);
  width: 100%;
  gap: 24px;

  @include media(tablet) {
    gap: 16px;
  }

  @include media(mobile) {
    gap: 24px;
  }

  &__header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @include media(tablet) {
      gap: 8px;
    }

    @include media(mobile) {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }

  &__hint {
    @include flex-container(column, normal, center);
    padding: 0 16px;
    gap: 10px;

    @include media(tablet) {
      padding: 16px;
      gap: 8px;
      justify-content: space-between;
    }
  }

  &__hint-title {
    color: $white;
    font: $font-h1-32;

    @include media(tablet) {
      font: $font-h2-24;
    }
  }

  &__hint-description {
    color: $gray-300;
    font: $font-body-16;

    @include media(tablet) {
      font: $font-body-14;
    }
  }

  &__field-edit {
    color: $gray-300;
    cursor: pointer;
  }

  &__trade-link {
    color: $gray-300;
    font: $font-body-16;

    @include media(mobile) {
      display: none;
    }
  }

  &__trade-link-mobile {
    display: none;

    @include media(mobile) {
      @include flex-container(column, center, center);
      border: 2px solid $outline-15;
      border-radius: 50%;
    }
  }

  &__email-status {
    color: $green;
    text-decoration: underline;
    font: $font-body-16;

    @include media(mobile) {
      display: none;
    }
  }

  &__email-status-mobile {
    display: none;

    @include media(mobile) {
      @include flex-container(column, center, center);
      color: $green;
    }
  }
}
</style>
