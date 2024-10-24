<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { watch } from "vue";

const props = defineProps(["username"]);

watch(
  () => props.username,
  (newValue, oldValue) => {
    location.reload();
  },
);
</script>

<template>
  <main>
    <h1>{{ props.username }}</h1>
    <PostListComponent :username="props.username" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
