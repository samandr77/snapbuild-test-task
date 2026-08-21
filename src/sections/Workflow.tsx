import { useState } from 'react'
import { FeatureList } from '../components/FeatureList'
import { CloudIcon, ConfigIcon, StackIcon, SystemIcon } from '../components/Icons'
import { OptionPanels, type OptionPanel } from '../components/OptionPanels'
import shot1 from '../assets/wflow/step-1.webp'
import shot2 from '../assets/wflow/step-2.webp'
import shot3 from '../assets/wflow/step-3.webp'
import shot4 from '../assets/wflow/step-4.webp'
import { SectionHeader } from '../components/SectionHeader'
import { workflow } from '../data'

/** Иконки идут в том же порядке, что и этапы внедрения */
const stepIcons = [SystemIcon, ConfigIcon, StackIcon, CloudIcon]

/** Кадры этапов — из набора исходного сайта, в том же порядке */
const stepShots = [shot1, shot2, shot3, shot4]

/**
 * НОВАЯ СЕКЦИЯ — «Внедрение за четыре шага».
 * Галерея на всю ширину: свёрнутые панели — узкие полосы с иконкой снизу,
 * раскрытая собирает всё в одной плашке — название этапа, срок, описание
 * и чек-лист.
 * Кадр этапа лежит под фирменным градиентом и слегка затемнён, чтобы текст
 * поверх него читался.
 */
export function Workflow() {
  const [active, setActive] = useState(0)

  const panels: OptionPanel[] = workflow.steps.map((item, i) => ({
    id: item.num,
    icon: stepIcons[i],
    main: item.name,
    sub: item.time,
    media: stepShots[i],
    content: (
      <>
        <span className="wflow__head">
          <span className="wflow__head-name">{item.name}</span>
          <span className="wflow__head-time">{item.time}</span>
        </span>

        <p className="wflow__text">{item.detail}</p>

        <FeatureList
          className="wflow__checklist"
          items={item.checklist.map((text) => ({ text }))}
        />
      </>
    ),
  }))

  return (
    <section className="section workflow" id="workflow">
      <SectionHeader className="dds-reveal" title={workflow.title} subtitle={workflow.subtitle} />

      <OptionPanels
        className="wflow__gallery dds-reveal dds-reveal--delay-1"
        items={panels}
        label="Этапы внедрения"
        active={active}
        onSelect={setActive}
        panelId={`workflow-panel-${workflow.steps[active].num}`}
      />
    </section>
  )
}
