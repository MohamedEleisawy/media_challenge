import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { auth, db } from "../firebaseConfig"; // adapte le chemin selon ton projet
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import type { InferType } from "yup";
// import { navigate } from "expo-router/build/global-state/routing";
import  { router } from "expo-router";
// Schéma de validation Yup
const schema = yup.object({
  prenom: yup.string().required("Le prénom est obligatoire"),
  nom: yup.string().required("Le nom est obligatoire"),
  email: yup.string().email("Email invalide").required("Email est obligatoire"),
  password: yup.string().min(6, "Minimum 6 caractères").required("Mot de passe obligatoire"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "Les mots de passe doivent correspondre")
    .required("Confirmation obligatoire"),
});

// Typage TypeScript des données du formulaire déduit automatiquement
type FormData = InferType<typeof schema>;

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Création de l'utilisateur avec Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Ajout des informations supplémentaires dans Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        createdAt: Timestamp.fromDate(new Date()),
      });
      alert("Inscription réussie !");
      router.replace('/login'); // Redirection vers la page de connexion
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Erreur : " + error.message);
      } else {
        alert("Une erreur inconnue est survenue");
      }
    }

  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 400, margin: "auto" }}>
      <div>
        <label>Prénom</label>
        <input {...register("prenom")} />
        <p style={{ color: "red" }}>{errors.prenom?.message}</p>
      </div>

      <div>
        <label>Nom</label>
        <input {...register("nom")} />
        <p style={{ color: "red" }}>{errors.nom?.message}</p>
      </div>

      <div>
        <label>Email</label>
        <input type="email" {...register("email")} />
        <p style={{ color: "red" }}>{errors.email?.message}</p>
      </div>

      <div>
        <label>Mot de passe</label>
        <input type="password" {...register("password")} />
        <p style={{ color: "red" }}>{errors.password?.message}</p>
      </div>

      <div>
        <label>Confirme mot de passe</label>
        <input type="password" {...register("confirmPassword")} />
        <p style={{ color: "red" }}>{errors.confirmPassword?.message}</p>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
      </button>
    </form>
  );
}
