<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post"]);
const vote = ref(undefined);
const loaded = ref(false);
const votes = ref(undefined);
const voted = ref(false);

const voteCorrect = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}/cvote/correct`, "POST");
    await getVotes();
  } catch {
    return;
  }
  await getUserVote();
  await checkVote();
};
const voteIncorrect = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}/cvote/incorrect`, "POST");
    await getVotes();
  } catch {
    return;
  }
  await getUserVote();
  await checkVote();
};
const removeVote = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}/cvote`, "DELETE");
    await getVotes();
  } catch {
    return;
  }
  await getUserVote();
  await checkVote();
};
const getUserVote = async () => {
  try {
    vote.value = await fetchy(`/api/posts/${props.post._id}/cvote/user`, "GET");
    console.log(vote.value);
  } catch {
    return;
  }
};
const getVotes = async () => {
  try {
    votes.value = await fetchy(`/api/posts/${props.post._id}/cvote`, "GET");
  } catch {
    return;
  }
};
const checkVote = async () => {
  try {
    voted.value = await fetchy(`/api/posts/${props.post._id}/cvote/check`, "GET");
  } catch {
    return;
  }
};
onBeforeMount(async () => {
  await getVotes();
  await getUserVote();
  await checkVote();
  loaded.value = true;
});
</script>

<template>
  <div class="base">
    <section v-if="loaded">
      <menu>
        <li v-if="vote !== true || voted === false"><button class="btn-small pure-button" @click="voteCorrect()">Correct</button></li>
        <li v-else><button class="btn-small pure-button" @click="removeVote()">Remove Correct Vote</button></li>
        <li v-if="votes !== undefined">{{ votes["Correct Votes"] }}</li>
        <li v-if="vote !== false || voted === false"><button class="btn-small pure-button" @click="voteIncorrect()">Incorrect</button></li>
        <li v-else><button class="btn-small pure-button" @click="removeVote()">Remove Incorrect Vote</button></li>
        <li v-if="votes !== undefined">{{ votes["Incorrect Votes"] }}</li>
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
