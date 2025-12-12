<script setup>
const { locales, setLocale } = useI18n()
</script>

<template>
  <div>
    <button v-for="locale in locales" @click="setLocale(locale.code)">
      {{ locale.name }}
    </button>
  </div>
</template>
