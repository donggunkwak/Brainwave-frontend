<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["request"]);
const content = ref("");
const emit = defineEmits(["refreshRequests"]);
const { currentUsername } = storeToRefs(useUserStore());

const acceptRequest = async (verificationContent: string) => {
  try {
    await fetchy(`/api/verified/request/${props.request._id}`, "POST", { body: { verificationContent } });
  } catch {
    return;
  }
  emit("refreshRequests");
};
const rejectRequest = async () => {
  try {
    await fetchy(`/api/verified/request/${props.request._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshRequests");
};
const reroute = async (path: string) => {
  void router.push({ path: path });
};
</script>

<template>
  <p class="author" @click="reroute(`/profile/${props.request.user}`)">{{ props.request.user }}</p>
  <p>{{ props.request.requestContent }}</p>
  <div class="base">
    <menu>
      <form @submit.prevent="acceptRequest(content)">
        <label for="content">Verification Contents:</label>
        <textarea id="content" v-model="content" placeholder="Verification Specification"> </textarea>
        <button type="submit" class="pure-button-primary pure-button">Accept Request</button>
        <button class="button-error pure-button" @click="rejectRequest">Reject Request</button>
      </form>
    </menu>
    <article class="timestamp">
      <p v-if="props.request.dateCreated !== props.request.dateUpdated">Edited on: {{ formatDate(props.request.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.request.dateCreated) }}</p>
    </article>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  width: 20em;
  padding: 0.5em;
  border-radius: 4px;
  display: block;
  resize: none;
}
</style>
