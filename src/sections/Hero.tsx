import { ButtonLink } from '../components/Button'
import {
  BannerIcon,
  ChevronIcon,
  ClapIcon,
  ClipIcon,
  CloudUpIcon,
  CodeIcon,
  CollapseIcon,
  CreateIcon,
  DeckIcon,
  GridIcon,
  ImagePlusIcon,
  PhotoIcon,
  PlayIcon,
  PresetIcon,
  SearchIcon,
  SparkleIcon,
  StarIcon,
  SystemMarkIcon,
  ToolsIcon,
} from '../components/Icons'
import { hero } from '../data'

type NavItem = { icon: (p: { className?: string }) => JSX.Element; label: string; dot?: boolean }

const library: NavItem[] = [
  { icon: GridIcon, label: 'Все сайты' },
  { icon: PhotoIcon, label: 'Изображения', dot: true },
  { icon: PlayIcon, label: 'Видео' },
  { icon: DeckIcon, label: 'Презентации' },
  { icon: BannerIcon, label: 'Баннеры' },
  { icon: StarIcon, label: 'Избранные' },
  { icon: CloudUpIcon, label: 'Опубликованные' },
]

const knowledge: NavItem[] = [
  { icon: SystemMarkIcon, label: 'Дизайн-система' },
  { icon: PresetIcon, label: 'Пресеты' },
  { icon: ToolsIcon, label: 'Инструменты маркетинга' },
]

const modes = [
  { icon: CodeIcon, label: 'Веб-сайт' },
  { icon: ImagePlusIcon, label: 'Изображение' },
  { icon: ClapIcon, label: 'Видео' },
  { icon: DeckIcon, label: 'Презентация' },
  { icon: BannerIcon, label: 'Баннер' },
]

/**
 * Первый экран: скруглённая градиентная панель с отступом от краёв окна —
 * ключевой приём исходного сайта. Внутри — заголовок, кнопка с градиентным
 * текстом и тёмное окно приложения вместо растрового скриншота.
 */
export function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero__panel">
        <div className="hero__copy">
          <h1 className="hero__title dds-reveal">{hero.title}</h1>
          <p className="hero__subtitle dds-reveal dds-reveal--delay-1">{hero.subtitle}</p>
          <div className="hero__actions dds-reveal dds-reveal--delay-2">
            <ButtonLink href="#demo" variant="launch" size="l">
              {hero.primaryCta}
            </ButtonLink>
          </div>
        </div>

        <div className="hero__media dds-reveal dds-reveal--delay-3" aria-hidden="true">
          <div className="app">
            <aside className="app__side">
              <div className="app__brand">
                <span className="app__brand-name">
                  <span className="app__brand-mark" />
                  снэпбилд
                </span>
                <CollapseIcon className="app__collapse" />
              </div>

              <div className="app__search">
                <SearchIcon />
                <span>Поиск</span>
                <kbd className="app__kbd">⌘S</kbd>
              </div>

              <div className="app__create">
                <CreateIcon />
                Создать
              </div>

              {[
                { title: 'Сайты', items: library },
                { title: 'База знаний', items: knowledge },
              ].map((group) => (
                <div className="app__group" key={group.title}>
                  <span className="app__group-title">
                    {group.title}
                    <ChevronIcon />
                  </span>
                  {group.items.map(({ icon: Icon, label, dot }) => (
                    <span className="app__side-item" key={label}>
                      <Icon />
                      {label}
                      {dot && <i className="app__dot" />}
                    </span>
                  ))}
                </div>
              ))}
            </aside>

            <div className="app__main">
              <p className="app__greeting">Алексей, создадим что-то новое?</p>

              <div className="app__composer">
                <span className="app__placeholder">Опишите, что вы хотите сгенерировать…</span>
                <span className="app__composer-bar">
                  <span className="app__attach">
                    <ClipIcon />
                    Прикрепить
                  </span>
                  <span className="app__spark">
                    <SparkleIcon />
                  </span>
                </span>
              </div>

              <div className="app__modes">
                {modes.map(({ icon: Icon, label }) => (
                  <span className="app__mode" key={label}>
                    <Icon />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
