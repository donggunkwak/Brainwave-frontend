<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post"]);
const liked = ref(false);
const loaded = ref(false);
const numLikes = ref(0);

const deleteLike = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}/likes`, "DELETE");
    await getNumLikes();
  } catch {
    return;
  }
  await checkLiked();
};
const addLike = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}/likes`, "POST");
    await getNumLikes();
  } catch {
    return;
  }
  await checkLiked();
};
const getNumLikes = async () => {
  try {
    numLikes.value = await fetchy(`/api/posts/${props.post._id}/likes`, "GET");
  } catch {
    return;
  }
};
const checkLiked = async () => {
  try {
    liked.value = await fetchy(`/api/posts/${props.post._id}/likes/check`, "GET");
  } catch {
    return;
  }
};
onBeforeMount(async () => {
  await checkLiked();
  await getNumLikes();
  loaded.value = true;
});
</script>

<template>
  <div class="base">
    <section v-if="loaded">
      <menu>
        <li v-if="!liked"><button class="btn-small pure-button" @click="addLike()">Like</button></li>
        <li v-else><button class="btn-small pure-button" @click="deleteLike()">Unlike</button></li>
        {{ numLikes }}
      </menu>
    </section>
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
</style>
