import { BookDemo, LoginLink } from '../components/Cta';
import { ContactForm } from '../components/ContactForm';
import { Eyebrow, Scene, SceneHeading, SceneItem, SceneLead } from '../components/Scene';
import { contact } from '../data/content';
import { sectionById } from '../data/sections';

const meta = sectionById('contact');

export function Contact() {
  return (
    <Scene meta={meta}>
      <SceneItem>
        <Eyebrow num={meta.num} label={meta.eyebrow} />
      </SceneItem>
      <SceneItem>
        <SceneHeading id="contact-heading">{contact.heading}</SceneHeading>
      </SceneItem>
      <SceneItem>
        <SceneLead>{contact.lead}</SceneLead>
      </SceneItem>
      <SceneItem>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <BookDemo large />
          <LoginLink />
        </div>
      </SceneItem>
      <SceneItem>
        <ContactForm />
      </SceneItem>
    </Scene>
  );
}
