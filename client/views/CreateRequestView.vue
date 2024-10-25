<script setup lang="ts">
import CreateRequestForm from "@/components/Verification/CreateRequestForm.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <section v-if="isLoggedIn">
    <h2>Create a Verification Request:</h2>
    <p>Type here to explain anything you'd like to explain about your certification, including a link to an image proving your certification.</p>
    <CreateRequestForm />
  </section>
  <section v-else>
    <h2>Must be logged in to create a verification request!</h2>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
