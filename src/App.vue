<script setup lang="ts">
import MailComp from './components/MailComp.vue';
import SetValuesComp from './components/SetValuesComp.vue';
import WebComp from './components/WebComp.vue';


</script>

<template>
  <div>
    <h1 class="text-emerald-600 font-bold">HTML Checker</h1>
    <SetValuesComp />
    <div style="display: flex; gap: 2%;">
      <WebComp />
      <MailComp />
    </div>
  </div>
</template>

<style scoped>
h1 {
  margin: 0.7em 0;
}
</style>