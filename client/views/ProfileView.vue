<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import VerificationListComponent from "@/components/Verification/VerificationListComponent.vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { watch } from "vue";

const props = defineProps(["username"]);
const { currentUsername } = storeToRefs(useUserStore());

watch(
  () => props.username,
  (newValue, oldValue) => {
    location.reload();
  },
);
const reroute = async (path: string) => {
  void router.push({ path: path });
};
</script>

<template>
  <main>
    <h1>{{ props.username }}</h1>
    <VerificationListComponent :username="props.username"></VerificationListComponent>
    <button v-if="currentUsername === props.username" @click="reroute('/request')">Submit A Verification</button>
    <PostListComponent :username="props.username" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
button {
  display: block;
  margin: 0 auto;
  background-color: rgb(77, 111, 135);
  color: rgb(198, 199, 199);
}
</style>
