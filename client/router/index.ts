import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import RequestListComponent from "../components/Verification/RequestListComponent.vue";
import CreatePostView from "../views/CreatePostView.vue";
import CreateRequestView from "../views/CreateRequestView.vue";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import PostView from "../views/PostView.vue";
import ProfileView from "../views/ProfileView.vue";
import SettingView from "../views/SettingView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },
    {
      path: "/setting",
      name: "Settings",
      component: SettingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/createpost",
      name: "Create Post",
      component: CreatePostView,
      meta: { requiresAuth: true },
    },
    {
      path: "/posts/:id",
      name: "Post View",
      component: PostView,
      props: true,
    },
    {
      path: "/profile/:username",
      name: "Profile",
      component: ProfileView,
      props: true,
    },
    {
      path: "/request",
      name: "Verification Request",
      component: CreateRequestView,
    },
    {
      path: "/adminRequests",
      name: "Administer Requests",
      component: RequestListComponent,
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }
});

export default router;
