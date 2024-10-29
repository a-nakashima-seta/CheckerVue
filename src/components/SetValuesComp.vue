<script setup lang="ts">
import { ref } from 'vue';
import { useSetValues } from '../store/setValues';

const store = useSetValues();
const inputValue = ref<string>("");

const handleSetValues = () => {
    const lines = inputValue.value.split('\n');
    if (lines.length === 3) {
        store.prod_cd = lines[0].trim();
        store.title = lines[1].trim();
        store.preheader = lines[2].trim();
        store.saveValues();
        inputValue.value = "";
    } else {
        alert("3行でタイトル、プリヘッダー、申込番号を入力してください。");
    }
};

const handleEdit = (field: 'title' | 'preheader' | 'prod_cd') => {
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
        <form class="setArea">
            <textarea v-model="inputValue" placeholder="タイトル, プリヘッダー, 申込番号を3行で入力"></textarea>
            <button class="setButton" @click="handleSetValues">セットする</button>
        </form>

        <div class="displayArea">
            <div class="editArea">
                <h4>タイトル:</h4>
                <p class="editAreaWrap">
                    <span>{{ store.title }}</span>
                    <button class="editButton" @click="handleEdit('title')">編集</button>
                </p>
            </div>
            <div class="editArea">
                <h4>プリヘッダー:</h4>
                <p class="editAreaWrap">
                    <span>{{ store.preheader }}</span>
                    <button class="editButton" @click="handleEdit('preheader')">編集</button>
                </p>
            </div>
            <div class="editArea">
                <h4>申込番号:</h4>
                <p class="editAreaWrap">
                    <span>{{ store.prod_cd }}</span>
                    <button class="editButton" @click="handleEdit('prod_cd')">編集</button>
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
    margin: 0.4em auto;
    background-color: #C0EBA6;
    transition: all .3s ease;
}

.setButton:hover {
    background-color: #347928;
    color: #FFFFFF;
}

.displayArea {
    background-color: #FFFFFF;
    margin: 0 auto 1em;
    padding: 1.5em 1em;
    border-radius: .7em;
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
    padding-bottom: .3em;
    margin: 0;
}

.editAreaWrap span {
    font-size: 20px;
}

.editButton {
    font-size: 14px;
    background-color: #FFFBE6;
    transition: all .3s ease;
}

.editButton:hover {
    background-color: #FCCD2A;
}
</style>