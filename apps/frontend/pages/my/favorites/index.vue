<script setup lang="ts">
  definePageMeta({ name: 'my-favorites' })
</script>

<template>
  <div>
    <h1>My Favorites</h1>
    <ul>
      <li v-for="item in favorites" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>
  import { ref } from 'vue';
  const route = useRoute();
  const router = useRouter();
  const safeReplaceQuery = (q: Record<string, any>) => {
    router.replace({ path: route.path, query: q });
  };

  export default {
    setup() {
      const favorites = ref([]);

      return { favorites, safeReplaceQuery };
    }
  };
</script>