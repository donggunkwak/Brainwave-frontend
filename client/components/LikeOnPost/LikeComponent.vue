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
        <li v-if="!liked">
          <button class="button button-like" @click="addLike()">
            <i class="fa fa-heart">♥</i>
            <span>Like</span>
          </button>
          {{ numLikes }}
        </li>
        <li v-else>
          <button class="button button-like liked" @click="deleteLike()">
            <i class="fa fa-heart">♥</i>
            <span>Unlike</span>
            {{ numLikes }}
          </button>
        </li>
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
.button-like {
  border: 2px solid #8a8a8a;
  background-color: #fefefe;
  text-decoration: none;
  padding: 1rem;
  position: relative;
  vertical-align: middle;
  text-align: center;
  display: inline-block;
  border-radius: 3rem;
  color: #8a8a8a;
  transition: all ease 0.4s;
}

.button-like span {
  margin-left: 0.5rem;
}
.button-like .fa,
.button-like span {
  transition: all ease 0.4s;
}

.button-like:focus {
  background-color: #fefefe;
}

.button-like:focus .fa,
.button-like:focus span {
  color: #8a8a8a;
}

.button-like:hover {
  border-color: #cc4b37;
  background-color: #fefefe;
}

.button-like:hover .fa,
.button-like:hover span {
  color: #cc4b37;
}

.liked {
  background-color: #cc4b37;
  border-color: #cc4b37;
}

.liked .fa,
.liked span {
  color: #fefefe;
}

.liked:focus {
  background-color: #cc4b37;
}

.liked:focus .fa,
.liked:focus span {
  color: #fefefe;
}

.liked:hover {
  background-color: #cc4b37;
  border-color: #cc4b37;
}

.liked:hover .fa,
.liked:hover span {
  color: #fefefe;
}
</style>
