<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());
const { currentUsername, isAdmin } = storeToRefs(useUserStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  <header>
    <nav>
      <div class="title">
        <img src="@/assets/images/brain.png" />
        <RouterLink :to="{ name: 'Home' }">
          <h1>Brainwave</h1>
        </RouterLink>
      </div>
      <ul>
        <li>
          <RouterLink :to="{ name: 'Home' }" :class="{ underline: currentRouteName == 'Home' }">
            <span class="material-icons"> home </span>
          </RouterLink>
        </li>
        <li v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Create Post' }" :class="{ underline: currentRouteName == 'Create Post' }">
            <span class="material-icons" style="width: 25px"> add box </span>
          </RouterLink>
        </li>
        <li v-if="isLoggedIn">
          <RouterLink :to="{ path: `/profile/${currentUsername}` }" :class="{ underline: currentRouteName == 'Profile' }">
            <span class="material-icons" style="width: 25px"> person </span>
          </RouterLink>
        </li>
        <li v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Settings' }" :class="{ underline: currentRouteName == 'Settings' }">
            <span class="material-icons" style="width: 25px"> settings </span>
          </RouterLink>
        </li>
        <li v-else>
          <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> <span class="material-icons" style="width: 25px"> login </span> </RouterLink>
        </li>
        <li v-if="isLoggedIn && isAdmin">
          <RouterLink :to="{ name: 'Administer Requests' }" :class="{ underline: currentRouteName == 'Administer Requests' }">
            <span class="material-icons" style="width: 25px"> admin_panel_settings </span>
          </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <RouterView />
</template>

<style scoped>
@import "./assets/toast.css";
:global(body) {
  background-color: rgb(207, 238, 242);
}

nav {
  padding: 1em 2em;
  background-color: rgb(28, 101, 141);
  display: flex;
  align-items: center;
}

h1 {
  font-size: 2em;
  margin: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 2em;
}

a {
  font-size: large;
  color: rgb(0, 0, 0);
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

.underline {
  text-decoration: underline;
}
</style>
