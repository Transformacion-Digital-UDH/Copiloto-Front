<template>
  <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-full">
    <div class="flex justify-center items-center content-center px-14 flex-col">
      <h3 class="bg-gray-200 h-10 w-full rounded-md duration-200 skeleton-loader"></h3><br>
    </div>
    <div class="mt-6 space-y-10">
      <div class="bg-white rounded-md p-6 space-y-4">
        <div class="grid grid-cols-1 gap-6">
          <div class="bg-gray-200 rounded-md max-w-[820px] w-full mx-auto h-36 p-4 skeleton-loader duration-200"></div>
        </div>
        <div class="bg-gray-200 h-36 rounded-md max-w-[820px] w-full mx-auto skeleton-loader duration-200"></div>
        <div class="text-center mt-6">
          <div class="h-10 bg-gray-200 rounded w-44 mx-auto skeleton-loader duration-200"></div>
        </div><p class="h-4 mt-6"></p>
      </div>
      <div class="bg-white rounded-md p-6 h-auto mt-4 animate-pulse duration-200">
        <div class="block space-y-5">
          <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200 mb-9"></h2>
          <div class="h-7">
            <h2 class="bg-gray-200 h-10 w-64 mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-md p-6 h-auto mt-4 animate-pulse duration-200">
        <div class="block space-y-5">
          <h2 class="bg-gray-200 h-8 w-2/4 rounded-md skeleton-loader duration-200"></h2>
          <h2 class="bg-gray-200 h-24 w-full rounded-md skeleton-loader duration-200"></h2>
        </div>
      </div>
      <div class="bg-white rounded-md p-6 h-auto mt-4 animate-pulse duration-200">
        <div class="block space-y-5">
          <h2 class="bg-gray-200 h-8 w-44 rounded-md skeleton-loader duration-200"></h2>
          <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
        </div>
      </div>
      <div class="flex justify-between">
        <div class="block space-y-5"><h2 class="px-4 py-2 h-11 w-28 rounded-md skeleton-loader duration-200"></h2></div>
        <div class="block space-y-5"><h2 class="px-4 py-2 h-11 w-28 rounded-md skeleton-loader duration-200"></h2></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>