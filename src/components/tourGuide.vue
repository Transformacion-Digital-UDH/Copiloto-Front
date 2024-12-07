<template>
    <div>
      <slot></slot>
      <button @click="startTour">Iniciar Tour</button>
    </div>
  </template>
  
  <script>
  import { TourGuideClient } from "@sjmc11/tourguidejs/dist/tour.js";
  
  export default {
    name: "TourGuide",
    mounted() {
      this.tour = new TourGuideClient();
    },
    methods: {
      startTour() {
        this.tour.start();
      },
    },
  };
  </script>
  