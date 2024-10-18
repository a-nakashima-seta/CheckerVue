import { onMounted, ref } from 'vue';
import { defineStore } from 'pinia';

export const useSetValues = defineStore('setValues', () => {
    const prod_cd = ref<string>("");
    const title = ref<string>("");
    const preheader = ref<string>("");

    onMounted(() => {
        loadValues();
    });

    const loadValues = () => {
        const storedTitle = localStorage.getItem("title");
        const storedProdCd = localStorage.getItem("prod_cd");
        const storedPreheader = localStorage.getItem("preheader");

        if (storedTitle) title.value = storedTitle;
        if (storedProdCd) prod_cd.value = storedProdCd;
        if (storedPreheader) preheader.value = storedPreheader;
    };

    const saveValues = () => {
        localStorage.setItem("title", title.value);
        localStorage.setItem("prod_cd", prod_cd.value);
        localStorage.setItem("preheader", preheader.value);
    };

    return { prod_cd, title, preheader, loadValues, saveValues };
});
