<script setup lang="ts">
import RequestComponent from "@/components/Verification/RequestComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const loaded = ref(false);
let requests = ref<Array<Record<string, string>>>([]);
const { isAdmin } = storeToRefs(useUserStore());

async function getRequests() {
  try {
    requests.value = await fetchy("/api/verified/request", "GET");
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  await getRequests();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isAdmin">
    <section class="requests" v-if="loaded && requests.length !== 0">
      <article v-for="request in requests" :key="request._id">
        <RequestComponent :request="request" @refreshRequests="getRequests"></RequestComponent>
      </article>
    </section>
    <p v-else-if="loaded">No requests found</p>
    <p v-else>Loading...</p>
  </section>
  <p v-else>MUST BE AN ADMIN TO ACCESS THIS PAGE!</p>
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

.requests {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
