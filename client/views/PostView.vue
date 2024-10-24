<script setup lang="ts">
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["id"]);
let editing = ref("");
const loaded = ref(false);

function updateEditing(id: string) {
  editing.value = id;
}
let post = ref<Record<string, string>>();
const getPost = async () => {
  let postResults;
  try {
    postResults = await fetchy(`/api/posts/${props.id}`, "GET");
  } catch (e) {
    console.log("error");
    console.log(e);
  }
  post.value = postResults;
};

onBeforeMount(async () => {
  await getPost();
  loaded.value = true;
});
</script>

<template>
  <section v-if="loaded && post !== undefined">
    <PostComponent v-if="editing !== post._id" :post="post" :showComments="true" @editPost="updateEditing" />
    <EditPostForm v-else :post="post" @refreshPosts="getPost" @editPost="updateEditing" />
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
