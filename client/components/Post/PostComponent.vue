<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import CommentListComponent from "../CommentOnPost/CommentListComponent.vue";
import VoteComponent from "../CorrectnessVotingOnPost/VoteComponent.vue";
import LikeComponent from "../LikeOnPost/LikeComponent.vue";

const props = defineProps(["post", "showComments"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
};
const reroute = async (path: string) => {
  void router.push({ path: path });
};
</script>

<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  <p class="author" @click="reroute(`/profile/${props.post.author}`)">{{ props.post.author }}</p>
  <p @click="reroute(`/posts/${props.post._id}`)">{{ props.post.content }}</p>
  <LikeComponent :post="props.post"></LikeComponent>
  <VoteComponent :post="props.post"></VoteComponent>
  <div class="base">
    <menu v-if="props.post.author == currentUsername">
      <li>
        <button class="btn-small pure-button" @click="emit('editPost', props.post._id)">
          <span class="material-icons" style="width: 25px"> edit </span>
        </button>
      </li>
      <li>
        <button class="button-error btn-small pure-button" @click="deletePost">
          <span class="material-icons" style="width: 25px"> delete </span>
        </button>
      </li>
    </menu>
    <article class="timestamp" @click="reroute(`/posts/${props.post._id}`)">
      <p v-if="props.post.dateCreated !== props.post.dateUpdated">Edited on: {{ formatDate(props.post.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.post.dateCreated) }}</p>
    </article>
  </div>
  <CommentListComponent v-if="props.showComments === true" :post="props.post"></CommentListComponent>
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
  justify-content: flex-end;
  gap: 1em;
  padding: 0;
  margin: 0;
}
template {
  background-color: rgb(140, 213, 231);
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
</style>
