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
        <li v-if="votes !== undefined">{{ votes["Correct Votes"] }}</li>
        <li v-if="vote !== true || voted === false">
          <button class="button-correct" @click="voteCorrect()">
            <p class="fa">✓</p>
          </button>
        </li>
        <li v-else>
          <button class="button-correctClicked" @click="removeVote()">
            <p class="fa">✓</p>
          </button>
        </li>
        <li v-if="vote !== false || voted === false">
          <button class="button-incorrect" @click="voteIncorrect()">
            <p class="fa">✕</p>
          </button>
        </li>
        <li v-else>
          <button class="button-incorrectClicked" @click="removeVote()">
            <p class="fa">✕</p>
          </button>
        </li>
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
.button-incorrect {
  border: 2px solid #8a8a8a;
  background-color: #fefefe;
  text-decoration: none;
  padding: 0.2em 0.3em;
  position: relative;
  vertical-align: middle;
  text-align: center;
  display: inline-block;
  color: #8a8a8a;
  transition: all ease 0.4s;
}

.button-incorrect span {
  margin-left: 0.5rem;
}
.button-incorrect .fa,
.button-incorrect span {
  transition: all ease 0.4s;
}

.button-incorrect:focus {
  background-color: #fefefe;
}

.button-incorrect:focus .fa,
.button-incorrect:focus span {
  color: #8a8a8a;
}

.button-incorrect:hover {
  border-color: #cc4b37;
  background-color: #fefefe;
}

.button-incorrect:hover .fa,
.button-incorrect:hover span {
  color: #cc4b37;
}

.button-incorrectClicked {
  border: 2px solid #8a8a8a;
  text-decoration: none;
  padding: 0.2em 0.3em;
  position: relative;
  vertical-align: middle;
  text-align: center;
  display: inline-block;
  transition: all ease 0.4s;
  background-color: #cc4b37;
}
.button-incorrectClicked .fa,
.button-incorrectClicked span {
  color: #fefefe;
}

.button-correct {
  border: 2px solid #8a8a8a;
  background-color: #fefefe;
  text-decoration: none;
  padding: 0.2em 0.3em;
  position: relative;
  vertical-align: middle;
  text-align: center;
  display: inline-block;
  color: #8a8a8a;
  transition: all ease 0.4s;
}

.button-correct span {
  margin-left: 0.5rem;
}
.button-correct .fa,
.button-correct span {
  transition: all ease 0.4s;
}

.button-correct:focus {
  background-color: #fefefe;
}

.button-correct:focus .fa,
.button-correct:focus span {
  color: #8a8a8a;
}

.button-correct:hover {
  border-color: #37cc50;
  background-color: #fefefe;
}

.button-correct:hover .fa,
.button-correct:hover span {
  color: #37cc50;
}

.button-correctClicked {
  border: 2px solid #8a8a8a;
  text-decoration: none;
  padding: 0.2em 0.3em;
  position: relative;
  vertical-align: middle;
  text-align: center;
  display: inline-block;
  transition: all ease 0.4s;
  background-color: #37cc50;
}
.button-correctClicked .fa,
.button-correctClicked span {
  color: #fefefe;
}
</style>
