<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import VerificationsComponent from "./VerificationsComponent.vue";

const props = defineProps(["username"]);
let verifications = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);

const getVerifications = async () => {
  let verifResults;
  try {
    verifResults = await fetchy(`/api/verified/${props.username}`, "GET");
  } catch {
    return;
  }
  if (verifResults !== null) {
    verifications.value = verifResults;
  }
};
onBeforeMount(async () => {
  await getVerifications();
  loaded.value = true;
});
</script>

<template>
  <main>
    <h1 v-if="verifications.length === 0">{{ props.username }} is unverified</h1>
    <h1 v-else>{{ props.username }} is verified</h1>
    <section class="verifications" v-if="loaded && verifications.length !== 0">
      <article v-for="verification in verifications" :key="verification._id">
        <VerificationsComponent :username="props.username" :verification="verification" @refresh-verifications="getVerifications"></VerificationsComponent>
      </article>
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
.verifications {
  padding: 1em;
}
li {
  text-align: center;
}
</style>
