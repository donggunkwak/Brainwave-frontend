<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["username", "verification"]);
const emit = defineEmits(["refreshVerifications"]);

const { isAdmin } = storeToRefs(useUserStore());

const deleteVerification = async (id: string) => {
  try {
    await fetchy(`/api/verified/${id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshVerifications");
};
</script>

<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  <main>
    <li>
      {{ props.verification.verificationContent }}, Verified on {{ props.verification.dateCreated.substring(0, props.verification.dateCreated.indexOf("T")) }}
      <button v-if="isAdmin" class="button-error pure-button" @click="deleteVerification(props.verification._id)">
        <span class="material-icons" style="width: 25px"> delete </span>
      </button>
    </li>
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
