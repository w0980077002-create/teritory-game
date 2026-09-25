const texts={
  roadmap:['Дорожная карта','Главы и этапы должны открываться последовательно. При переходе главы меняется только локационный фон; герой, последователь и HUD остаются постоянными.'],
  hero:['Герой','Основной персонаж — постоянный. Его уровень, HP, энергия, опыт и экипировка берутся из игрового состояния.'],
  companion:['Последователь','Последователь остаётся тем же персонажем между главами. Меняются только противники и фон соответствующего этапа.'],
  port:['Порт','Основной раздел навигации.'],
  skills:['Навыки','Боевые навыки и улучшения персонажа.'],
  adventure:['Приключения','Карта и прохождение глав.'],
  shop:['Магазин','Торговая система и предметы.'],
  quest:['Основная глава','Текущая цель прохождения и прогресс задания.']
};
const panel=document.querySelector('#panel');
const title=document.querySelector('#panel-title');
const text=document.querySelector('#panel-text');
document.querySelectorAll('.hz').forEach(b=>b.addEventListener('click',()=>{
  const t=texts[b.dataset.action]||['',''];
  title.textContent=t[0]; text.textContent=t[1]; panel.classList.add('show'); panel.setAttribute('aria-hidden','false');
}));
document.querySelector('#close').onclick=()=>{panel.classList.remove('show');panel.setAttribute('aria-hidden','true')};
panel.addEventListener('click',e=>{if(e.target===panel)document.querySelector('#close').click()});
