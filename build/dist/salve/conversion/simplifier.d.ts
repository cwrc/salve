/**
 * Simplification support for trees produced by the parser module.
 *
 * This is an implementation in TypeScript of the XSLT pipeline we've been
 * using. The step numbers are equivalent to those in the XSLT pipeline with the
 * following exceptions:
 *
 * - Some steps are combined. The driving principles are:
 *
 *  + Steps are not combined if a later step is entirely dependent on the work
 *    of an earlier step.
 *
 *  + Steps are combined if they offer substantial performance benefits.
 *
 * Eventually the goal is to completely eliminate the XSLT pipeline. However,
 * during the transition phase we aim for relative parity with what the XSLT
 * pipeline does, in order to simplify testing. With a few small exceptions, we
 * can provide an input to a step and expect the same output in the XSLT and
 * TypeScript pipelines. So the TypeScript implementation may do things that
 * appears senseless. For instance, at some point all ``define`` elements are
 * renamed to make them unique, even those that do not have name clashes. We
 * replicate the XSLT process, where only renaming clashing defines would be
 * onerous. (It would also require the renaming operation to verify that new
 * names do not clash with those names that are not changed. If we change all
 * names, then this clash cannot occur.)
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
export { step1 } from "./simplifier/step1";
export { step4 } from "./simplifier/step4";
export { step6 } from "./simplifier/step6";
export { step9 } from "./simplifier/step9";
export { step10 } from "./simplifier/step10";
export { step14 } from "./simplifier/step14";
export { step15 } from "./simplifier/step15";
export { step16 } from "./simplifier/step16";
export { step17 } from "./simplifier/step17";
export { step18 } from "./simplifier/step18";
