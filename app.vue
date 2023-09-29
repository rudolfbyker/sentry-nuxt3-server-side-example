<template>
  <h2>Config</h2>
  <pre>{{ JSON.stringify(runtimeConfig, undefined, 2) }}</pre>

  <h2>Bored API</h2>
  <pre>{{ JSON.stringify(a.data.value, undefined, 2) }}</pre>
  <button @click="a.refresh">Refresh client side</button>
  <button @click="reload">Refresh server side</button>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();

const a = useAsyncData('foo', () => {
  console.log("Starting fetch …");
  return fetch("https://www.boredapi.com/api/activity").then(res => {
    console.log("Finished fetch!");
    return res.json();
  });
})

function reload() {
  window.location.reload();
}
</script>
