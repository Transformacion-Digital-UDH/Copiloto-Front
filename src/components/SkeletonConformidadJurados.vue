<template>
  <div class="flex-1 p-10 bg-gray-100 min-h-full">
    <div class="flex justify-center items-center content-center px-14 flex-col">
      <h3 class="bg-gray-200 h-10 w-full rounded-md duration-200 skeleton-loader"></h3><br>
    </div>
    <div class="mt-6 space-y-10">
      <div class="bg-white rounded-md p-6 space-y-4 animate-pulse duration-200">
        <div class="text-center"><p class="h-4 rounded w-2/3"></p></div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="bg-gray-200 rounded-md h-36 p-6 skeleton-loader duration-200"></div>
          <div class="bg-gray-200 rounded-md h-36 p-6 skeleton-loader duration-200"></div>
          <div class="bg-gray-200 rounded-md h-36 p-6 skeleton-loader duration-200"></div>
        </div>
        <div class="bg-gray-200 h-44 rounded-md p-6 -m-0 skeleton-loader duration-200"></div>
        <div class="text-center mt-6">
          <div class="h-10 bg-gray-200 rounded w-44 mx-auto skeleton-loader duration-200"></div>
        </div><p class="h-4 mt-6"></p>
      </div>
      <div class="bg-white rounded-md p-6 relative animate-pulse">
        <div class="flex items-center">
          <div class="h-8 bg-gray-200 rounded w-80 skeleton-loader duration-200"></div>
        </div>
        <div class="overflow-x-auto mt-4">
          <div class="h-6 rounded w-1/3 mb-2"></div>
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-8 w-2/5 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
          <div class="h-6 rounded w-1/3 mb-2"></div>
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-8 w-2/5 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
          <div class="h-6 rounded w-1/3 mb-2"></div>
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-8 w-2/5 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-md shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
        <div class="block space-y-5 mb-3">
          <h2 class="bg-gray-200 h-8 w-44 rounded-md skeleton-loader duration-200"></h2>
          <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
        </div>
        <div class="block space-y-5 mb-3">
          <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
        </div>
        <div class="block space-y-5 mb-3">
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