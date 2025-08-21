<template>
  <footer class="footer">
    <div class="footer__upper">
      <div class="container footer__upper-wrapper">
        <div class="footer__upper-left">
          <div class="footer__upper-brand">
            <Logo class="footer__logo" />
            <div class="footer__upper-description">
              Самые быстрые выплаты и трейды Торгуйте безопасно на нашей
              платорме
            </div>
          </div>
          <FooterSocial class="footer__upper-social" />
        </div>
        <div class="footer__upper-right">
          <div
            v-for="(column, idx) in FOOTER_CONFIG.navigation"
            :key="idx"
            class="footer__upper-column"
          >
            <div class="footer__upper-column-title">{{ column.title }}</div>
            <div class="footer__upper-column-fields">
              <router-link
                v-for="(link, idx) in column.links"
                :key="idx"
                class="footer__upper-column-field"
                :to="link.url"
                >{{ link.name }}</router-link
              >
            </div>
          </div>
        </div>
        <FooterSocial class="footer__upper-social-mobile" />
      </div>
    </div>
    <div class="footer__lower">
      <div class="container footer__lower-wrapper">
        <div class="footer__lower-left">© StoneSkins • 2025</div>
        <div class="footer__lower-right">
          <router-link
            v-for="(link, idx) in FOOTER_CONFIG.legal"
            :to="link.url"
            >{{ link.name }}</router-link
          >
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import Logo from '@/assets/images/logo.svg'
import FooterSocial from '@/components/Footer/FooterSocial.vue'
import { FOOTER_CONFIG } from '@/components/Footer/data.ts'
</script>

<style lang="scss" scoped>
.footer {
  display: grid;
  grid-template-columns: 1fr;

  &__logo {
    color: $white;
  }

  &__upper-wrapper {
    @include flex-container(row, normal, space-between);
    padding-right: 150px;

    @include media(tablet) {
      padding: 0;
    }

    @include media(mobile) {
      @include flex-container(column, normal, normal);
      gap: 32px;
    }
  }

  &__upper {
    border-top: 1px solid $gray-900;
    border-bottom: 1px solid $gray-900;
    padding: 60px 0 105px 0;

    @include media(tablet) {
      padding: 45px 0 60px 0;
    }

    @include media(mobile) {
      padding: 48px 0 32px 0;
    }
  }

  &__upper-left {
    @include flex(column);
    gap: 50px;
  }

  &__upper-description {
    font: $font-body-16;
    color: $gray-300;
  }

  &__upper-brand {
    @include flex(column);
    gap: 32px;
    max-width: 300px;
  }

  &__upper-right {
    @include flex(row);
    gap: 80px;

    @include media(tablet) {
      gap: 45px;
    }

    @include media(mobile) {
      @include flex(column);
      gap: 24px;
    }
  }

  &__upper-column {
    @include flex(column);
    gap: 16px;
  }

  &__upper-column-title {
    font: $font-body-16;
    color: $gray-300;
  }

  &__upper-column-fields {
    @include flex(column);
    gap: 12px;
  }

  &__upper-column-field {
    font: $font-body-16;
    color: $white;
    text-decoration: none;
  }

  &__upper-social {
    @include media(mobile) {
      display: none;
    }
  }

  &__upper-social-mobile {
    display: none;

    @include media(mobile) {
      display: grid;
    }
  }

  &__lower {
    padding-top: 32px;
    padding-bottom: 40px;

    @include media(mobile) {
      padding-bottom: 21px;
    }
  }

  &__lower-wrapper {
    @include flex-container(row, center, space-between);

    @include media(mobile) {
      @include flex-container(column, normal, normal);
      gap: 24px;
    }
  }

  &__lower-left {
    color: $gray-300;
    font: $font-body-16;

    @include media(tablet) {
      font: $font-body-14;
    }

    @include media(mobile) {
      font: $font-body-16;
    }
  }

  &__lower-right {
    @include flex(row);
    gap: 32px;

    @include media(mobile) {
      @include flex(column);
      gap: 16px;
    }

    a {
      color: $gray-300;
      font: $font-body-16;
      text-decoration: none;

      @include media(tablet) {
        font: $font-body-14;
      }
    }
  }
}
</style>
