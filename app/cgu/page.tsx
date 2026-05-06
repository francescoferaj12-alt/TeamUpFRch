'use client'

import { useLang } from '../../lib/lang-context'

export default function CGUPage() {
  const { lang } = useLang()

  const content = {
    fr: {
      badge: "Conditions d'utilisation",
      title: "Règles de la plateforme",
      updated: 'En vigueur depuis : Mai 2025',
      intro: "En utilisant TeamUpFR, vous acceptez les présentes conditions. Veuillez les lire attentivement. TeamUpFR est une plateforme gratuite dédiée au football amateur du canton de Fribourg, Suisse.",
      sections: [
        { title: '1. Acceptation des conditions', content: "En créant un compte sur TeamUpFR, vous acceptez les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, vous ne pouvez pas utiliser la plateforme." },
        { title: '2. Eligibilité', content: "TeamUpFR est ouvert à toute personne de 14 ans ou plus. Les mineurs de moins de 18 ans doivent avoir l'accord de leurs parents ou tuteurs légaux pour s'inscrire." },
        { title: '3. Compte utilisateur', content: "Vous êtes responsable de la sécurité de votre compte et de votre mot de passe. Vous devez fournir des informations exactes et à jour. Un seul compte par personne est autorisé. Tout compte créé avec de fausses informations peut être supprimé." },
        { title: '4. Contenu autorisé', content: "Vous pouvez publier des informations sportives vous concernant (position, stats, expérience), des annonces de recrutement légitimes, des messages respectueux entre utilisateurs, des photos de profil appropriées." },
        { title: '5. Contenu interdit', content: "Il est strictement interdit de publier du contenu offensant, discriminatoire ou haineux, de fausses informations sur votre identité ou vos compétences, du spam ou des publicités non autorisées, du contenu portant atteinte aux droits d'autrui." },
        { title: '6. Responsabilité', content: "TeamUpFR est une plateforme de mise en relation. Nous ne sommes pas responsables des accords conclus entre utilisateurs, des informations inexactes publiées par les utilisateurs, des litiges entre joueurs, coachs et clubs." },
        { title: '7. Suspension et suppression', content: "TeamUpFR se réserve le droit de suspendre ou supprimer tout compte qui viole les présentes conditions, sans préavis. Les utilisateurs peuvent supprimer leur compte à tout moment depuis leur profil ou en contactant support@teamupfr.ch." },
        { title: '8. Propriété intellectuelle', content: "Le nom, le logo et l'identité visuelle de TeamUpFR sont la propriété exclusive de ses fondateurs. Vous conservez les droits sur le contenu que vous publiez, mais accordez à TeamUpFR une licence d'affichage sur la plateforme." },
        { title: '9. Modifications', content: "TeamUpFR se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés par email en cas de modification importante." },
        { title: '10. Droit applicable', content: "Les présentes conditions sont soumises au droit suisse. Tout litige sera soumis aux tribunaux compétents du canton de Fribourg, Suisse." },
      ]
    },
    de: {
      badge: 'Nutzungsbedingungen',
      title: 'Plattformregeln',
      updated: 'Gültig ab: Mai 2025',
      intro: "Durch die Nutzung von TeamUpFR stimmen Sie diesen Bedingungen zu. Bitte lesen Sie sie sorgfältig durch. TeamUpFR ist eine kostenlose Plattform für den Amateurfussball im Kanton Freiburg, Schweiz.",
      sections: [
        { title: '1. Annahme der Bedingungen', content: "Durch die Erstellung eines Kontos auf TeamUpFR akzeptieren Sie diese Allgemeinen Nutzungsbedingungen. Wenn Sie diese Bedingungen nicht akzeptieren, können Sie die Plattform nicht nutzen." },
        { title: '2. Berechtigung', content: "TeamUpFR steht allen Personen ab 14 Jahren offen. Minderjährige unter 18 Jahren benötigen die Zustimmung ihrer Eltern oder gesetzlichen Vertreter zur Registrierung." },
        { title: '3. Benutzerkonto', content: "Sie sind für die Sicherheit Ihres Kontos und Passworts verantwortlich. Sie müssen genaue und aktuelle Informationen angeben. Pro Person ist nur ein Konto erlaubt. Konten mit falschen Informationen können gelöscht werden." },
        { title: '4. Erlaubte Inhalte', content: "Sie dürfen sportliche Informationen über sich selbst veröffentlichen (Position, Statistiken, Erfahrung), legitime Rekrutierungsanzeigen, respektvolle Nachrichten zwischen Benutzern und angemessene Profilfotos." },
        { title: '5. Verbotene Inhalte', content: "Es ist streng verboten, beleidigende, diskriminierende oder hasserfüllte Inhalte zu veröffentlichen, falsche Informationen über Ihre Identität oder Fähigkeiten, Spam oder nicht autorisierte Werbung, Inhalte die Rechte Dritter verletzen." },
        { title: '6. Haftung', content: "TeamUpFR ist eine Vermittlungsplattform. Wir sind nicht verantwortlich für Vereinbarungen zwischen Benutzern, ungenaue Informationen von Benutzern oder Streitigkeiten zwischen Spielern, Trainern und Vereinen." },
        { title: '7. Sperrung und Löschung', content: "TeamUpFR behält sich das Recht vor, Konten die gegen diese Bedingungen verstossen ohne Vorankündigung zu sperren oder zu löschen. Benutzer können ihr Konto jederzeit über ihr Profil oder per E-Mail an support@teamupfr.ch löschen." },
        { title: '8. Geistiges Eigentum', content: "Name, Logo und visuelle Identität von TeamUpFR sind ausschliessliches Eigentum der Gründer. Sie behalten die Rechte an den von Ihnen veröffentlichten Inhalten, gewähren TeamUpFR jedoch eine Anzeigelizenz auf der Plattform." },
        { title: '9. Änderungen', content: "TeamUpFR behält sich das Recht vor, diese Bedingungen jederzeit zu ändern. Benutzer werden bei wesentlichen Änderungen per E-Mail informiert." },
        { title: '10. Anwendbares Recht', content: "Diese Bedingungen unterliegen dem Schweizer Recht. Alle Streitigkeiten werden den zuständigen Gerichten des Kantons Freiburg, Schweiz, vorgelegt." },
      ]
    }
  }

  const c = content[lang]

  return (
    <>
      <section style={{ background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', padding: '4rem 2rem 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 100, padding: '6px 18px', marginBottom: '1.25rem' }}>
            <span>📋</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,.85)', textTransform: 'uppercase' }}>{c.badge}</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#fff', letterSpacing: 2, lineHeight: 1, marginBottom: '.75rem' }}>{c.title}</h1>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>{c.updated}</p>
        </div>
      </section>

      <section style={{ background: '#fff', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-bright)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2.5rem', fontSize: 15, color: 'var(--blue-mid)', lineHeight: 1.7 }}>
            {c.intro}
          </div>

          {c.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: i < c.sections.length - 1 ? '1px solid var(--gray-light)' : 'none' }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: 1, color: 'var(--blue-dark)', marginBottom: '.75rem' }}>{s.title}</h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>{s.content}</p>
            </div>
          ))}

          <div style={{ background: 'var(--gray-bg)', borderRadius: 14, padding: '1.5rem', textAlign: 'center', marginTop: '1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>⚽</div>
            <div style={{ fontWeight: 600, marginBottom: '.25rem' }}>TeamUpFR</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {lang === 'fr' ? 'Fait à Fribourg, Suisse 🇨🇭' : 'Gemacht in Freiburg, Schweiz 🇨🇭'}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
