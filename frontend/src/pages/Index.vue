<template>
  <div class="container">
    <Hero />
    <Advantages />
    <Instruction />
  </div>
  <Reviews />
  <div class="container">
    <Hub />
    <Sell />
  </div>
</template>
<script setup lang="ts">
import Hero from '@/components/Index/Hero/Hero.vue'
import Advantages from '@/components/Index/Advantages/Advantages.vue'
import Instruction from '@/components/Index/Instruction/Instruction.vue'
import Reviews from '@/components/Index/Reviews/Reviews.vue'
import Hub from '@/components/Index/Hub/Hub.vue'
import Sell from '@/components/Index/Sell/Sell.vue'
</script>
