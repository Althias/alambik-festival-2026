import React from "react";
import "./InfoUtiles.css";

const infos = [
  {
    title: "Alambik' Festival",
    text: "L'Alambik' Festival est un Festival PRIVÉ. Si vous n'êtes pas invités, il est inutile d'acheter une place ! (Mais merci pour ce don)"
  },
  {
    title: "Logement",
    text: "Pour dormir, il faut prévoir une tente, ainsi que le matériel habituel pour camper. Une zone de camping est dédiée pour l'ensemble des festivaliers."
  },
  {
    title: "Déguisements",
    text: "Pour plus de fun, n'hésite pas à venir déguisé à l'Alambik' ! Le meilleur déguisement remporte un prix incroyable !"
  },
  {
    title: "Espaces Privés",
    text: "L'accès à la maison est exclusivement réservé aux bénévoles. Interdiction formelle d'entrer dans le bâtiment. Merci de respecter cette consigne."
  },
  {
    title: "Billetterie",
    text: "La billetterie est ouverte, mais fermera aux alentours du 1er juillet, afin de pouvoir organiser les quantités de commande. Cette année, la place est à 30€, peut importe la durée de votre séjour à l'Alambik'. Si vous en avez les moyens et que vous souhaitez soutenir financièrement le festival, un billet à 35€ et un billet à 40€ sont disponibles, mais ne donne accès à aucun avantage supplémentaire. Cet argent sert à payer les artistes qui vivent de leur art, à les défrayer, à louer le matériel de son et de lumière, à gérer les infrastructures (toilettes, douche, …), à la décoration, à l'essence pour nos trajets dans le cadre de l'Alambik', … Nous ne faisons aucun bénéfice !"
  },
  {
    title: "Boisson",
    text: "Pour consommer des boissons, des cartes conso sont réservables en avance, ou sur place. (Privilégez en avance svp). Une carte coute 10€ et possède 10 « trous ». Prix des conso envisagé : bière/vin, « 1 trou », cocktail, « 2 trous », sans alcool : gratuit."
  },
  {
    title: "Nourriture",
    text: "Chaque repas coûte 4€, et est 100% végétarien. L'ensemble des petits déjeuners sont gratuits. On fonctionne comme à la cantine : les horaires sont fixes. On fait la queue, on récupère son assiette et on se régale. Vous pouvez apporter votre propre nourriture si vous le souhaitez.\n\nNOUVEAUTÉ : les repas doivent être réservés en avance (lors de l'achat de votre place), afin d'éviter tout gaspillage. On a conscience que cela donne une impression de billet d'accès au festival plus cher, mais c'est vraiment plus pratique pour nous."
  },
  {
    title: "Horaires et lieu",
    text: "Le festival commence le samedi 11 juillet à 14h, et se termine le mardi 14 juillet à 12h. Le lieu n'est noté nulle part sur notre site internet. Le festival étant privé, nous préférons éviter les invités surprise. Vous pouvez nous contacter directement pour avoir l'adresse exacte (la même que les années précédentes)."
  },
  {
    title: "Infrastructures",
    text: "Des urinoirs masculins et des urinoirs féminins seront à disposition. Merci de faire tous vos petits pipi dans ces espaces afin de nos faciliter la vie, et l'extraction de vos déchets organiques. Des toilettes sèches sont disponibles également pour déféquer, ne vous en faites pas ! Sur place, une douche (chauffée) est dispo également. Essayez d'être rapide pour limiter l'attente s'il y en a (et économiser l'eau évidemment !)."
  },
  {
    title: "Fumeurs",
    text: "Des cendriers sont disponibles sur place. Merci de ne jeter AUCUN mégot par terre !"
  },
  {
    title: "Safe Place",
    text: "On a confiance en vous, mais on préfère le rappeler ! Merci de faire de l'Alambik' festival un espace de confiance. Pas de moqueries, pas de gestes déplacés, et du consentement ! Pour qu'on puisse tous.tes passer un bon week end."
  },
  {
    title: "Contact",
    text: "Pour toute question, vous pouvez nous contacter à l'adresse mail : alambikfestival@gmail.com ou bien au 0626578441."
  }
];

export default function InfoUtiles() {
  return (
    <div className="info-utiles-page">
      <nav className="info-utiles-nav">
        <h1>Infos</h1>
      </nav>
      <div className="info-utiles-grid">
        {infos.map((info, idx) => (
          <div className="info-utiles-card" key={idx}>
            <h2>{info.title}</h2>
            {info.text.split('\n\n').map((paragraph, pIdx) => (
              <p key={pIdx}>{paragraph}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
