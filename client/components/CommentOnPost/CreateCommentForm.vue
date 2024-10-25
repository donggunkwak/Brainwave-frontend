<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const props = defineProps(["post"]);
const emit = defineEmits(["refreshComments"]);

const createComment = async (content: string) => {
  try {
    await fetchy(`/api/posts/${props.post._id}/comments`, "POST", {
      body: { content },
    });
  } catch (_) {
    return;
  }
  emit("refreshComments");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createComment(content)">
    <label for="content">Comment Contents:</label>
    <textarea id="content" v-model="content" placeholder="Create a Comment!" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Comment</button>
  </form>
</template>

<style scoped>
form {
  background-color: rgb(77, 111, 135);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  background-color: rgb(234, 245, 248);
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}

button {
  background-color: rgb(19, 60, 109);
}

label {
  color: rgb(37, 63, 50);
}
</style>
