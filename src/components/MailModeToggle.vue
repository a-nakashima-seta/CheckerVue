<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
</script>

<template>
  <Tabs
    default-value="通常"
    class="w-[400px] m-auto mt-5 mb-5"
  >
    <TabsList class="grid w-full grid-cols-3">
      <TabsTrigger value="通常">通常</TabsTrigger>
      <TabsTrigger value="日和">日和</TabsTrigger>
      <TabsTrigger value="イチオシ">イチオシ</TabsTrigger>
    </TabsList>
  </Tabs>
</template>
