<script setup lang="ts">
import { ref } from "vue";
import { useSetValues } from "../store/setValues";
import { Textarea } from "../components/ui/textarea";

const store = useSetValues();
const inputValue = ref<string>("");

const handleSetValues = () => {
  const lines = inputValue.value.split("\n");
  if (lines.length === 3) {
    store.title = lines[0].trim();
    store.preheader = lines[1].trim();
    store.prod_cd = lines[2].trim();
    store.saveValues();
    inputValue.value = "";
  } else {
    alert("3行でタイトル、プリヘッダー、申込番号を入力してください。");
  }
};

const handleEdit = (field: "title" | "preheader" | "prod_cd") => {
  const currentValue = store[field];
  const newValue = prompt(`${field}を編集:`, currentValue);
  if (newValue !== null) {
    store[field] = newValue.trim();
    store.saveValues();
  }
};
</script>

<template>
  <div>
    <form
      class="setArea"
      @submit.prevent="handleSetValues"
    >
      <Textarea
        v-model="inputValue"
        placeholder="タイトル, プリヘッダー, 申込番号を3行で入力"
      />

      <button class="setButton">セットする</button>
    </form>

    <div class="displayArea">
      <div class="editArea">
        <h4>タイトル:</h4>
        <p class="editAreaWrap">
          <span>{{ store.title }}</span>
          <button
            class="editButton"
            @click="handleEdit('title')"
          >
            編集
          </button>
        </p>
      </div>
      <div class="editArea">
        <h4>プリヘッダー:</h4>
        <p class="editAreaWrap">
          <span>{{ store.preheader }}</span>
          <button
            class="editButton"
            @click="handleEdit('preheader')"
          >
            編集
          </button>
        </p>
      </div>
      <div class="editArea">
        <h4>申込番号:</h4>
        <p class="editAreaWrap">
          <span>{{ store.prod_cd }}</span>
          <button
            class="editButton"
            @click="handleEdit('prod_cd')"
          >
            編集
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setArea {
  margin: 1em 0 1.5em;
}

.setArea textarea {
  width: 100%;
  height: 40px;
  font-size: 18px;
}

.setButton {
  display: block;
  margin: 1em auto;
  background-color: #c0eba6;
  transition: all 0.3s ease;
}

.setButton:hover {
  background-color: #347928;
  color: #ffffff;
}

.displayArea {
  background-color: #ffffff;
  margin: 0 auto 1em;
  padding: 1.5em 1em;
  border-radius: 0.7em;
}

.editArea {
  display: flex;
  flex-direction: column;
}

.editArea h4 {
  margin: 0;
  text-align: left;
}

.editAreaWrap {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: solid 1px #ddd;
  padding-bottom: 0.3em;
  margin: 0;
  gap: 1%;
}

.editAreaWrap span {
  font-size: 20px;
  text-align: left;
}

.editButton {
  font-size: 14px;
  background-color: #fffbe6;
  transition: all 0.3s ease;
  max-width: 70px;
  width: 30%;
}

.editButton:hover {
  background-color: #fccd2a;
}
</style>
